import { writable } from 'svelte/store';

const STORAGE_KEY = 'movie-night:flatmate';

function createUserStore() {
  let initial = null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) initial = JSON.parse(stored);
  } catch (_) {
    initial = null;
  }

  const { subscribe, set } = writable(initial);

  return {
    subscribe,
    login(user) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      } catch (_) {
        /* storage non disponibile, pazienza */
      }
      set(user);
    },
    logout() {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (_) {
        /* ignore */
      }
      set(null);
    },
  };
}

export const currentUser = createUserStore();

// "Router" leggero a stati: evita di aggiungere una libreria di routing
// per un'app a schermata singola con un flusso lineare.
export const view = writable('movies'); // movies | present | wheel | winner

// Dati condivisi tra le fasi della serata: selezionati in PresentSelector,
// consumati da Wheel e Winner.
export const nightSession = writable({
  presentUserIds: [],
  pool: [],
  winner: null,
});
