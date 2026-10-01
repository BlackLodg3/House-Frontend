<script>
  import { api } from './api.js';
  import { view, nightSession } from './stores.js';

  const PALETTE = ['#e8b34e', '#c1443c', '#4f9d6e', '#4e7de8', '#a34ee8', '#e8874e', '#4ec6e8', '#e84e9e'];

  let remaining = [...$nightSession.pool];
  let rotation = 0;
  let spinning = false;
  let pendingIndex = null;
  let eliminatedFlash = '';
  let flashTimer = null;
  let history = [];
  let declaring = false;
  let winnerDeclared = false;

  $: segAngle = remaining.length > 0 ? 360 / remaining.length : 360;
  $: gradient = remaining
    .map((_, i) => {
      const color = PALETTE[i % PALETTE.length];
      return `${color} ${i * segAngle}deg ${(i + 1) * segAngle}deg`;
    })
    .join(', ');

  function labelTransform(i) {
    const center = i * segAngle + segAngle / 2;
    return `rotate(${center}deg) translate(0, -108px) rotate(90deg)`;
  }

  function spin() {
    if (spinning || remaining.length <= 1) return;
    spinning = true;
    eliminatedFlash = '';
    clearTimeout(flashTimer);

    const targetIndex = Math.floor(Math.random() * remaining.length);
    const targetCenter = targetIndex * segAngle + segAngle / 2;
    const extraSpins = 5 + Math.floor(Math.random() * 3);

    pendingIndex = targetIndex;
    rotation = extraSpins * 360 + (360 - targetCenter);
  }

  function handleTransitionEnd() {
    if (pendingIndex === null) return;
    const idx = pendingIndex;
    pendingIndex = null;

    const [eliminated] = remaining.splice(idx, 1);
    remaining = remaining;
    history = [eliminated.title, ...history];
    eliminatedFlash = eliminated.title;
    flashTimer = setTimeout(() => (eliminatedFlash = ''), 2200);

    spinning = false;
    rotation = 0;

    // Se rimane solo 1 film, registriamo il vincitore senza cambiare pagina
    if (remaining.length === 1) {
      declareWinner(remaining[0]);
    }
  }

  async function declareWinner(movie) {
    declaring = true;
    try {
      await api.declareWinner(movie.id, $nightSession.presentUserIds);
    } catch (e) {
      // anche se la chiamata fallisce salviamo lo stesso il vincitore in UI
    }
    nightSession.update((s) => ({ ...s, winner: movie }));
    declaring = false;
    winnerDeclared = true; // Salva lo stato: ora l'utente può scegliere quando tornare alla home
  }

  function goHome() {
    view.set('movies');
  }
</script>

<div class="page wheel-page">
  <span class="eyebrow">Battle royale</span>

  {#if remaining.length === 1}
    <h1 class="winner-title">🏆 Vincitore: {remaining[0].title}!</h1>
    <p class="subtitle">La ruota ha parlato! Il film della serata è stato scelto.</p>
  {:else}
    <h1>{remaining.length} film in gara</h1>
    <p class="subtitle">Ogni spin elimina un film. L'ultimo rimasto vince la serata.</p>
  {/if}

  <div class="wheel-outer">
    <div class="pointer">▼</div>
    <div
      class="wheel"
      style="
        transform: rotate({rotation}deg);
        transition: {spinning ? 'transform 4s cubic-bezier(0.15, 0.68, 0.1, 1)' : 'none'};
        background: conic-gradient({gradient});
      "
      ontransitionend={handleTransitionEnd}
    >
      {#each remaining as movie, i (movie.id)}
        <span class="segment-label" style="transform: {labelTransform(i)};">
          {movie.title}
        </span>
      {/each}
    </div>
  </div>

  {#if eliminatedFlash}
    <p class="flash">{eliminatedFlash} eliminato</p>
  {/if}

  <!-- Pulsante di azione principale -->
  {#if remaining.length === 1}
    <button class="cta spin-btn" onclick={goHome}>
      Torna alla Home Film
    </button>
  {:else}
    <button
      class="cta spin-btn"
      disabled={spinning || declaring || remaining.length <= 1}
      onclick={spin}
    >
      {#if declaring}
        Registrazione vincitore…
      {:else if spinning}
        In rotazione…
      {:else}
        Gira la ruota
      {/if}
    </button>
  {/if}

  {#if history.length > 0}
    <div class="history">
      <span class="history-title">Eliminati</span>
      <ol>
        {#each history as title}
          <li>{title}</li>
        {/each}
      </ol>
    </div>
  {/if}
</div>

<style>
  .wheel-page {
    text-align: center;
  }

  .eyebrow {
    color: var(--gold);
    font-size: 0.8rem;
    font-weight: 600;
  }

  h1 {
    font-size: 1.85rem;
    margin: 0.2rem 0 0.4rem;
  }

  .winner-title {
    color: var(--gold);
  }

  .subtitle {
    color: var(--text-dim);
    font-size: 0.9rem;
    margin: 0 auto 2rem;
    max-width: 40ch;
  }

  .wheel-outer {
    position: relative;
    width: 260px;
    height: 260px;
    margin: 0 auto 1rem;
  }

  .pointer {
    position: absolute;
    top: -14px;
    left: 50%;
    transform: translateX(-50%);
    color: var(--gold);
    font-size: 1.6rem;
    z-index: 2;
    filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.5));
  }

  .wheel {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    position: relative;
    border: 4px solid var(--surface-raised);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.45);
  }

  .segment-label {
    position: absolute;
    top: 50%;
    left: 50%;
    transform-origin: 0 0;
    font-size: 0.68rem;
    font-weight: 600;
    color: #14121c;
    width: 90px;
    text-align: center;
    line-height: 1.15;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  .flash {
    color: var(--red);
    font-weight: 600;
    font-size: 0.95rem;
    min-height: 1.4rem;
    margin: 0.75rem 0;
  }

  .spin-btn {
    max-width: 280px;
    margin: 0.5rem auto 2rem;
    font-size: 1.05rem;
  }

  .history {
    text-align: left;
    max-width: 320px;
    margin: 0 auto;
  }

  .history-title {
    display: block;
    color: var(--text-dim);
    font-size: 0.8rem;
    margin-bottom: 0.4rem;
  }

  .history ol {
    margin: 0;
    padding-left: 1.2rem;
    color: var(--text-dim);
    font-size: 0.88rem;
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }
</style>