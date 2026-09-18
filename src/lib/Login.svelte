<script>
  import { api } from './api.js';
  import { currentUser } from './stores.js';

  let name = '';
  let password = '';
  let error = '';
  let loading = false;

  async function handleSubmit() {
    if (!name.trim() || !password) return;
    error = '';
    loading = true;
    try {
      const user = await api.login(name.trim(), password);
      currentUser.login(user);
    } catch (e) {
      error = e.message;
    } finally {
      loading = false;
    }
  }
</script>

<div class="login-page">
  <form class="login-card" on:submit|preventDefault={handleSubmit}>
    <span class="eyebrow">Casa</span>
    <h1>Film casa</h1>
    <p class="subtitle">Accedi per proporre e votare i film del gruppo.</p>

    <label>
      Nome
      <input type="text" bind:value={name} autocomplete="username" required />
    </label>

    <label>
      Password
      <input type="password" bind:value={password} autocomplete="current-password" required />
    </label>

    {#if error}
      <p class="error">{error}</p>
    {/if}

    <button class="cta" type="submit" disabled={loading}>
      {loading ? 'Accesso…' : 'Entra'}
    </button>
  </form>
</div>

<style>
  .login-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1.5rem;
  }

  .login-card {
    width: 100%;
    max-width: 360px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 2rem 1.75rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .eyebrow {
    color: var(--gold);
    font-size: 0.8rem;
    font-weight: 600;
  }

  h1 {
    font-size: 1.9rem;
  }

  .subtitle {
    color: var(--text-dim);
    margin: -0.5rem 0 0.25rem;
    font-size: 0.92rem;
  }

  label {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    font-size: 0.85rem;
    color: var(--text-dim);
  }
</style>
