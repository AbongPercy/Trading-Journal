// API helpers that talk to the NestJS backend.
// All requests go through the Vite dev proxy to http://localhost:3000.
// Authenticated requests automatically carry the stored JWT.

const TOKEN_KEY = 'trade-journal-token';

export const TOKEN_STORAGE_KEY = TOKEN_KEY;

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

async function request(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  if (options.body) headers['Content-Type'] = 'application/json';

  // Attach the JWT if we have one
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(path, { ...options, headers });
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      if (data.message) {
        message = Array.isArray(data.message) ? data.message.join(', ') : data.message;
      }
    } catch {
      // response had no JSON body - keep the generic message
    }
    const error = new Error(message);
    error.status = res.status;
    throw error;
  }
  return res.json();
}

function jsonBody(data) {
  return { body: JSON.stringify(data) };
}

// ---------------- Auth ----------------

// POST /api/auth/register — create an account
export function register(payload) {
  return request('/api/auth/register', {
    method: 'POST',
    ...jsonBody(payload),
  });
}

// POST /api/auth/login — returns { accessToken, user }
export function login(payload) {
  return request('/api/auth/login', {
    method: 'POST',
    ...jsonBody(payload),
  });
}

// GET /api/users/me — refresh the current user from the token
export function fetchMe() {
  return request('/api/users/me');
}

// ---------------- Trades ----------------

// GET /api/trades?month=2026-08
export function fetchTrades(month) {
  return request(`/api/trades?month=${month}`);
}

// GET /api/trades?year=2026
export function fetchTradesYear(year) {
  return request(`/api/trades?year=${year}`);
}

// GET /api/trades/stats?month=2026-08
export function fetchStats(month) {
  return request(`/api/trades/stats?month=${month}`);
}

// GET /api/trades/stats?year=2026
export function fetchYearStats(year) {
  return request(`/api/trades/stats?year=${year}`);
}

// POST /api/trades
export function createTrade(payload) {
  return request('/api/trades', {
    method: 'POST',
    ...jsonBody(payload),
  });
}

// PATCH /api/trades/:id  (edits the trade details, never the result)
export function updateTrade(id, payload) {
  return request(`/api/trades/${id}`, {
    method: 'PATCH',
    ...jsonBody(payload),
  });
}

// PATCH /api/trades/:id/hide — soft-delete
export function hideTrade(id) {
  return request(`/api/trades/${id}/hide`, { method: 'PATCH' });
}

// PATCH /api/trades/:id/close
export function closeTrade(id, payload) {
  return request(`/api/trades/${id}/close`, {
    method: 'PATCH',
    ...jsonBody(payload),
  });
}