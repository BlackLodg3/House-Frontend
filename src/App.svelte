<script>
  import { currentUser, view } from './lib/stores.js';
  import Login from './lib/Login.svelte';
  import MovieList from './lib/MovieList.svelte';
  import PresentSelector from './lib/PresentSelector.svelte';
  import Wheel from './lib/Wheel.svelte';
  import Winner from './lib/Winner.svelte';
</script>

<main>
  {#if !$currentUser}
    <Login />
  {:else if $view === 'movies'}
    <MovieList />
  {:else if $view === 'present'}
    <PresentSelector />
  {:else if $view === 'wheel'}
    <Wheel />
  {:else if $view === 'winner'}
    <Winner />
  {/if}
</main>

<style>
  main {
    min-height: 100vh;
  }
</style>
