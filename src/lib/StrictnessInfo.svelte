<script>
  import { view } from './stores.js';

  const levels = [
    {
      id: 0,
      title: 'Soft',
      badgeClass: 'soft',
      img: '/strictness_soft.webp',
      description: 'Tutti i film che hanno voto "yes" da tutti i presenti sono inseriti nella Ruota incredibile dei Films©.'
    },
    {
      id: 1,
      title: 'Medium',
      badgeClass: 'medium',
      img: '/strictness_medium.webp',
      description: 'Se il king che ha aggiunto un film alla lista non è presente quel film non può uscire nella Ruota incredibile dei Films©.\n\nEs. Giotto suggerisce "Natale a Povo", ma Giotto non è presente, allora purtroppo non si vedrà "Natale a Povo".'
    },
    {
      id: 2,
      title: 'Hard',
      badgeClass: 'hard',
      img: '/strictness_hard.webp',
      description: 'Se uno qualsiasi dei kings che hanno votato "yes" non è presente quel film non può uscire nella Ruota incredibile dei Films©.\n\nEs. "Il Padrino" è suggerito da Tollo e tutti sono d\'accordo che è un film che va assolutamente visto, anche perché potrebbe diventare parte del loro bagaglio culturale e comunque deve essere un bel film, allora basta che uno manchi e quel film non verrà visto.'
    }
  ];
</script>

<div class="page">
  <button class="back" on:click={() => view.set('present')}>← Torna alla selezione</button>

  <span class="eyebrow">Guida alle regole</span>
  <h1>Livelli di Rigidità</h1>
  <p class="subtitle">
    Ecco come funzionano i tre livelli di selezione per la generazione della ruota dei film.
  </p>

  <div class="cards-container">
    {#each levels as lvl (lvl.id)}
      <div class="level-card {lvl.badgeClass}">
        <div class="card-image-wrapper">
          <img src={lvl.img} alt={lvl.title} class="card-img" />
        </div>
        <div class="card-content">
          <div class="card-header">
            <h2>{lvl.title}</h2>
            <span class="badge {lvl.badgeClass}">Livello {lvl.id}</span>
          </div>
          <p class="card-description">{lvl.description}</p>
        </div>
      </div>
    {/each}
  </div>
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
    max-width: 48ch;
  }

  .cards-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .level-card {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 1rem;
    transition: border-color 0.2s ease;
  }

  .level-card.soft {
    border-left: 4px solid #22c55e;
  }

  .level-card.medium {
    border-left: 4px solid #f97316;
  }

  .level-card.hard {
    border-left: 4px solid #ef4444;
  }

  .card-image-wrapper {
    flex-shrink: 0;
  }

  .card-img {
    width: 80px;
    height: 80px;
    border-radius: 8px;
    object-fit: cover;
  }

  .card-content {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    flex: 1;
  }

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .card-header h2 {
    font-size: 1.15rem;
    margin: 0;
  }

  .badge {
    font-size: 0.75rem;
    font-weight: 600;
    padding: 0.2rem 0.55rem;
    border-radius: 20px;
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }

  .badge.soft {
    background: rgba(34, 197, 94, 0.15);
    color: #22c55e;
  }

  .badge.medium {
    background: rgba(249, 115, 22, 0.15);
    color: #f97316;
  }

  .badge.hard {
    background: rgba(239, 68, 68, 0.15);
    color: #ef4444;
  }

  .card-description {
    color: var(--text-dim);
    font-size: 0.88rem;
    line-height: 1.45;
    margin: 0;
    white-space: pre-line;
  }
</style>