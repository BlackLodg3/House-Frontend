<script>
  import { onMount } from 'svelte';
  import { api } from './api.js';
  import { currentUser, view } from './stores.js';

  let movies = [];
  let loading = true;
  let error = '';
  let newTitle = '';
  let adding = false;

  async function load() {
    loading = true;
    error = '';
    try {
      const res = await api.getWatchList($currentUser.id);
      movies = res.movies || [];
    } catch (e) {
      error = e.message;
    } finally {
      loading = false;
    }
  }

  onMount(load);

  function votedYes(movie) {
    return movie.voted_yes.some(name => name.toLowerCase() === $currentUser.name.toLowerCase());
  }

  function votedNo(movie) {
    return movie.voted_no.some(name => name.toLowerCase() === $currentUser.name.toLowerCase());
  }

async function toggle(movie, wants) {
  const currentName = $currentUser.name;
  
  // Case-insensitive helper function
  const isUser = (name) => name.toLowerCase() === currentName.toLowerCase();

  const alreadyVotedYes = movie.voted_yes.some(isUser);
  const alreadyVotedNo = movie.voted_no.some(isUser);

  // Guard clause: stop if clicking the option already selected
  if ((wants && alreadyVotedYes) || (!wants && alreadyVotedNo)) {
    return;
  }

  const prevYes = [...movie.voted_yes];
  const prevNo = [...movie.voted_no];

  // Remove current user from both arrays case-insensitively
  const cleanYes = movie.voted_yes.filter((n) => !isUser(n));
  const cleanNo = movie.voted_no.filter((n) => !isUser(n));

  if (wants) {
    movie.voted_yes = [...cleanYes, currentName];
    movie.voted_no = cleanNo;
  } else {
    movie.voted_yes = cleanYes;
    movie.voted_no = [...cleanNo, currentName];
  }

  // Trigger Svelte reactivity
  movies = movies;

  try {
    await api.toggleWatch($currentUser.id, movie.id, wants);
  } catch (e) {
    // Revert UI on network failure
    movie.voted_yes = prevYes;
    movie.voted_no = prevNo;
    movies = movies;
    error = e.message;
  }
}
  async function addMovie() {
    const title = newTitle.trim();
    if (!title) return;
    adding = true;
    error = '';
    try {
      await api.addMovie($currentUser.id, title);
      newTitle = '';
      await load();
    } catch (e) {
      error = e.message;
    } finally {
      adding = false;
    }
  }
</script>

<div class="page">
  <header>
    <div>
      <span class="eyebrow">Casa · Serata film</span>
      <h1>Tutti i Film</h1>
    </div>
    <div class="user-badge">
      <span>{$currentUser.name}</span>
      <button class="link" on:click={() => currentUser.logout()}>esci</button>
    </div>
  </header>

  <form class="add-form" on:submit|preventDefault={addMovie}>
    <input type="text" placeholder="Titolo del film…" bind:value={newTitle} />
    <button class="cta add-btn" type="submit" disabled={adding || !newTitle.trim()}>
      {adding ? '…' : 'Aggiungi'}
    </button>
  </form>

  {#if error}<p class="error">{error}</p>{/if}

  {#if loading}
    <p class="hint">Caricamento…</p>
  {:else if movies.length === 0}
    <p class="hint">Nessun film in lista. Proponi il primo.</p>
  {:else}
    <ul class="movie-list">
      {#each movies as movie (movie.id)}
        <li class="movie-card" class:rewatch={movie.watched}>
          <div class="movie-top">
            <div class="title-group">
              <span class="title">{movie.title}</span>
              {#if movie.watched}
                <span class="badge-rewatch">Già visto 🔄</span>
              {/if}
            </div>
            <span class="added-by">proposto da {movie.added_by}</span>
          </div>

          <div class="votes">
            <span class="vote-count yes">👍 {movie.voted_yes.length}</span>
            <span class="vote-count no">👎 {movie.voted_no.length}</span>
          </div>

          <div class="actions">
            <button
              class="vote-btn yes-btn"
              class:active={votedYes(movie)}
              on:click={() => toggle(movie, true)}
            >
              Sì
            </button>
            <button
              class="vote-btn no-btn"
              class:active={votedNo(movie)}
              on:click={() => toggle(movie, false)}
            >
              No
            </button>
          </div>
        </li>
      {/each}
    </ul>

    <button class="cta start-btn" on:click={() => view.set('present')}>
      Avvia la serata film
    </button>
  {/if}
</div>

<style>
  header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 1.5rem;
    gap: 1rem;
  }

  .eyebrow {
    color: var(--gold);
    font-size: 0.8rem;
    font-weight: 600;
  }

  h1 {
    font-size: 2rem;
    margin-top: 0.15rem;
  }

  .user-badge {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.2rem;
    color: var(--text-dim);
    font-size: 0.9rem;
  }

  .add-form {
    display: flex;
    gap: 0.6rem;
    margin-bottom: 1.5rem;
  }

  .add-form input {
    flex: 1;
  }

  .add-btn {
    width: auto;
    padding: 0.7rem 1.1rem;
  }

  .movie-list {
    list-style: none;
    margin: 0 0 1.75rem;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .movie-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-left: 3px solid var(--gold-dim);
    border-radius: var(--radius);
    padding: 1rem 1.1rem;
  }

  .movie-card.rewatch {
    border-left-color: var(--text-dim);
  }

  .movie-top {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 0.75rem;
    margin-bottom: 0.5rem;
  }

  .title-group {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .title {
    font-family: var(--font-display);
    font-size: 1.15rem;
    font-weight: 600;
  }

  .badge-rewatch {
    font-size: 0.7rem;
    background: var(--surface-raised);
    border: 1px solid var(--border);
    color: var(--gold);
    padding: 0.15rem 0.4rem;
    border-radius: 4px;
    font-weight: 500;
  }

  .added-by {
    color: var(--text-dim);
    font-size: 0.82rem;
    white-space: nowrap;
  }

  .votes {
    display: flex;
    gap: 1rem;
    font-size: 0.85rem;
    color: var(--text-dim);
    margin-bottom: 0.75rem;
  }

  .actions {
    display: flex;
    gap: 0.6rem;
  }

  .vote-btn {
    flex: 1;
    background: var(--surface-raised);
    border: 1px solid var(--border);
    color: var(--text-dim);
    border-radius: 7px;
    padding: 0.55rem 0.5rem;
    font-size: 0.85rem;
    font-weight: 500;
    transition: all 0.15s ease;
  }

  .yes-btn.active {
    background: rgba(79, 157, 110, 0.18);
    border-color: var(--green);
    color: var(--green);
  }

  .no-btn.active {
    background: rgba(193, 68, 60, 0.15);
    border-color: var(--red);
    color: var(--red);
  }

  .start-btn {
    font-size: 1.05rem;
    padding: 1rem;
  }
</style>