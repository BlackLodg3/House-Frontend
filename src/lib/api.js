const API_BASE = import.meta.env.VITE_API_BASE_URL ||  '';

const ERROR_TRANSLATIONS = {
  'Flatmate not found': 'Coinquilino non trovato',
  'Incorrect password': 'Password errata',
  'Invalid request body': 'Richiesta non valida',
  'Invalid request payload': 'Richiesta non valida',
  'Missing movie_name or user_id': 'Manca il titolo del film o l\'utente',
  'Missing user_id or movie_id': 'Dati mancanti',
  'At least one present user ID required': 'Seleziona almeno un presente',
  'Missing movie_id or present_user_ids': 'Dati mancanti per assegnare il vincitore',
  'Movie not found': 'Film non trovato',
};

function translate(message) {
  return ERROR_TRANSLATIONS[message] || message || 'Errore imprevisto';
}

async function request(path, { method = 'GET', body } = {}) {
  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (networkErr) {
    throw new Error('Impossibile contattare il server. È acceso e raggiungibile?');
  }

  if (!res.ok) {
    let message = `Errore ${res.status}`;
    try {
      const text = (await res.text()).trim();
      if (text) message = text;
    } catch (_) {
      /* ignore */
    }
    throw new Error(translate(message));
  }

  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return res.json();
  }
  return null;
}

export const api = {
  login(name, password) {
    return request('/api/login', { method: 'POST', body: { name, password } });
  },

  listFlatmates() {
    return request('/api/flatmates');
  },

  getWatchList(userId) {
    return request('/api/movies/watch-list', { method: 'POST', body: { user_id: userId } });
  },

  addMovie(userId, movieName) {
    return request('/api/movies/new', {
      method: 'POST',
      body: { user_id: userId, movie_name: movieName },
    });
  },

  toggleWatch(userId, movieId, wants) {
    return request('/api/movies/toggle-status', {
      method: 'POST',
      body: { user_id: userId, movie_id: movieId, wants },
    });
  },

  spinPool(presentUserIds, strictAttendance) {
    return request('/api/movies/spin-pool', {
      method: 'POST',
      body: { present_user_ids: presentUserIds, strict_attendance: strictAttendance },
    });
  },

  declareWinner(movieId, presentUserIds) {
    return request('/api/movies/winner', {
      method: 'POST',
      body: { movie_id: movieId, present_user_ids: presentUserIds },
    });
  },
};
