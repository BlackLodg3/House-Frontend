<script>
  import { nightSession, view } from './stores.js';

  function restart() {
    nightSession.set({ presentUserIds: [], pool: [], winner: null });
    view.set('movies');
  }
</script>

<div class="page winner-page">
  {#if $nightSession.winner}
    <span class="eyebrow">Ha vinto</span>
    <h1>{$nightSession.winner.title}</h1>
    <p class="subtitle">proposto da {$nightSession.winner.added_by}</p>
    <button class="cta" on:click={restart}>Torna alla lista film</button>
  {:else}
    <p class="hint">Nessun vincitore da mostrare.</p>
    <button class="cta" on:click={restart}>Torna alla lista film</button>
  {/if}
</div>

<style>
  .winner-page {
    text-align: center;
    padding-top: 5rem;
  }

  .eyebrow {
    color: var(--gold);
    font-size: 0.9rem;
    font-weight: 600;
  }

  h1 {
    font-size: 2.4rem;
    margin: 0.5rem 0 0.25rem;
    line-height: 1.15;
  }

  .subtitle {
    color: var(--text-dim);
    margin: 0 0 2.5rem;
  }

  .cta {
    max-width: 260px;
    margin: 0 auto;
  }
</style>
