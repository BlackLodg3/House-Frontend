<script>
  import { onMount } from 'svelte';
  import { api } from './api.js';
  import { currentUser, view, nightSession } from './stores.js';

  let flatmates = [];
  let selected = new Set();
  let strict = false;
  let loading = true;
  let error = '';
  let generating = false;

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
      const res = await api.spinPool(presentUserIds, strict);
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
    non attivi la modalità rigorosa.
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

    <label class="strict-toggle">
      <input type="checkbox" bind:checked={strict} />
      <span>
        Modalità rigorosa — escludi anche i film voluti solo da chi è assente
      </span>
    </label>

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
    margin: 0 0 1.25rem;
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
  }

  .flatmate.active {
    border-color: var(--gold-dim);
  }

  .flatmate input {
    width: 1.05rem;
    height: 1.05rem;
    accent-color: var(--gold);
  }

  .strict-toggle {
    display: flex;
    align-items: flex-start;
    gap: 0.6rem;
    color: var(--text-dim);
    font-size: 0.85rem;
    margin-bottom: 1.75rem;
    cursor: pointer;
  }

  .strict-toggle input {
    margin-top: 0.15rem;
    accent-color: var(--gold);
  }
</style>
