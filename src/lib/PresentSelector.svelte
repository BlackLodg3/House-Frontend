<script>
  import { onMount } from 'svelte';
  import { api } from './api.js';
  import { currentUser, view, nightSession } from './stores.js';

  let flatmates = [];
  let selected = new Set();
  let strictLevel = 0; // 0: Soft, 1: Medium, 2: Hard
  let maxDuration = 0; // 0: No limit (default)
  let loading = true;
  let error = '';
  let generating = false;

  const strictLevels = [
    { value: 0, label: 'Soft', color: 'soft', img: '/strictness_soft.webp' },
    { value: 1, label: 'Medium', color: 'medium', img: '/strictness_medium.webp' },
    { value: 2, label: 'Hard', color: 'hard', img: '/strictness_hard.webp' }
  ];

  const durationPresets = [
    { value: 100, label: '100 min' },
    { value: 130, label: '130 min' },
    { value: 190, label: '190 min' },
    { value: 0, label: 'No limit' }
  ];

  onMount(async () => {
    try {
      flatmates = await api.listFlatmates();
      selected.add($currentUser.id);
      selected = selected;
    } catch (e) {
      error = `${e.message} — serve l'endpoint GET /api/flatmates sul backend.`;
    } finally {
      loading = false;
    }
  });

  function toggleFlatmate(id) {
    if (selected.has(id)) selected.delete(id);
    else selected.add(id);
    selected = selected;
  }

  async function generatePool() {
    if (selected.size === 0) {
      error = 'Seleziona almeno un presente.';
      return;
    }
    generating = true;
    error = '';
    try {
      const presentUserIds = Array.from(selected);
      // Passa strictLevel e maxDuration aggiornati
      const res = await api.spinPool(presentUserIds, strictLevel, maxDuration);
      const pool = res.movies || [];
      if (pool.length === 0) {
        error = 'Nessun film idoneo con questa selezione.';
        return;
      }
      nightSession.set({ presentUserIds, pool, winner: null });
      view.set('wheel');
    } catch (e) {
      error = e.message;
    } finally {
      generating = false;
    }
  }
</script>

<div class="page">
  <button class="back" on:click={() => view.set('movies')}>← Torna alla lista</button>

  <span class="eyebrow">Prima dello spin</span>
  <h1>Chi c'è stasera?</h1>
  <p class="subtitle">
    I film voluti da chi non è presente non verranno esclusi automaticamente, a meno che
    non selezioni un livello di rigidità superiore.
  </p>

  {#if loading}
    <p class="hint">Caricamento coinquilini…</p>
  {:else if flatmates.length === 0 && error}
    <p class="error">{error}</p>
  {:else}
    <ul class="flatmate-list">
      {#each flatmates as f (f.id)}
        <li>
          <label class="flatmate" class:active={selected.has(f.id)}>
            <input
              type="checkbox"
              checked={selected.has(f.id)}
              on:change={() => toggleFlatmate(f.id)}
            />
            {f.name}
          </label>
        </li>
      {/each}
    </ul>

    <!-- Sezione Durata Massima -->
    <div class="duration-section">
      <div class="section-header">
        <span class="section-label">Durata massima</span>
      </div>

      <div class="duration-controls">
        <div class="duration-presets">
          {#each durationPresets as preset}
            <button
              type="button"
              class="preset-btn"
              class:active={maxDuration === preset.value}
              on:click={() => (maxDuration = preset.value)}
            >
              {preset.label}
            </button>
          {/each}
        </div>

        <div class="duration-input-wrapper">
          <input
            type="number"
            min="0"
            bind:value={maxDuration}
            class="duration-input"
            placeholder="Minuti"
          />
          <span class="input-unit">min</span>
        </div>
      </div>
    </div>

    <div class="strictness-section">
      <div class="section-header">
        <span class="section-label">Strictness level</span>
        <button 
          type="button" 
          class="info-btn" 
          on:click={() => view.set('strictness-info')}
          title="Scopri di più sui livelli di rigidità"
        >
          ⓘ Cos'è?
        </button>
      </div>

      <div class="strict-buttons">
        {#each strictLevels as lvl}
          <button
            type="button"
            class="strict-btn {lvl.color}"
            class:active={strictLevel === lvl.value}
            on:click={() => (strictLevel = lvl.value)}
          >
            <img src={lvl.img} alt={lvl.label} class="btn-icon" />
            <span class="btn-label">{lvl.label}</span>
          </button>
        {/each}
      </div>
    </div>

    {#if error}<p class="error">{error}</p>{/if}

    <button class="cta" disabled={generating} on:click={generatePool}>
      {generating ? 'Preparazione…' : 'Genera la ruota'}
    </button>
  {/if}
</div>

<style>
  .eyebrow {
    color: var(--gold);
    font-size: 0.8rem;
    font-weight: 600;
  }

  h1 {
    font-size: 1.85rem;
    margin: 0.2rem 0 0.5rem;
  }

  .subtitle {
    color: var(--text-dim);
    font-size: 0.9rem;
    margin: 0 0 1.5rem;
    max-width: 46ch;
  }

  .flatmate-list {
    list-style: none;
    margin: 0 0 1.5rem;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .flatmate {
    display: flex;
    align-items: center;
    gap: 0.65rem;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 0.7rem 0.9rem;
    font-size: 0.95rem;
    transition: border-color 0.15s ease;
    cursor: pointer;
  }

  .flatmate.active {
    border-color: var(--gold-dim);
  }

  .flatmate input {
    width: 1.05rem;
    height: 1.05rem;
    accent-color: var(--gold);
  }

  .section-label {
    color: var(--text-dim);
    font-size: 0.85rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  /* Stili per la sezione durata */
  .duration-section {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    margin-bottom: 1.75rem;
  }

  .duration-controls {
    display: flex;
    gap: 0.75rem;
    align-items: center;
  }

  .duration-presets {
    display: flex;
    gap: 0.4rem;
    flex: 1;
  }

  .preset-btn {
    flex: 1;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 0.6rem 0.3rem;
    font-size: 0.85rem;
    font-weight: 500;
    color: inherit;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .preset-btn.active {
    border-color: var(--gold);
    background: var(--gold-glow, rgba(212, 175, 55, 0.1));
    color: var(--gold);
  }

  .duration-input-wrapper {
    display: flex;
    align-items: center;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 0 0.5rem;
    width: 100px;
  }

  .duration-input {
    width: 100%;
    background: transparent;
    border: none;
    color: inherit;
    font-size: 0.9rem;
    padding: 0.6rem 0;
    text-align: right;
    outline: none;
  }

  .input-unit {
    font-size: 0.8rem;
    color: var(--text-dim);
    margin-left: 0.3rem;
  }

  .strictness-section {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    margin-bottom: 1.75rem;
  }

  .strict-buttons {
    display: flex;
    gap: 0.75rem;
  }

  .strict-btn {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.65rem;
    background: var(--surface);
    border: 2px solid var(--border);
    border-radius: 10px;
    padding: 1rem 0.5rem;
    cursor: pointer;
    transition: all 0.2s ease;
    color: inherit;
  }

  .strict-btn .btn-icon {
    width: 80px;
    height: 80px;
    border-radius: 8px;
    object-fit: cover;
  }

  .strict-btn .btn-label {
    font-size: 0.9rem;
    font-weight: 600;
  }

  /* Active states with colors */
  .strict-btn.soft.active {
    border-color: #22c55e;
    background: rgba(34, 197, 94, 0.1);
    color: #22c55e;
  }

  .strict-btn.medium.active {
    border-color: #f97316;
    background: rgba(249, 115, 22, 0.1);
    color: #f97316;
  }

  .strict-btn.hard.active {
    border-color: #ef4444;
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
  }
</style>