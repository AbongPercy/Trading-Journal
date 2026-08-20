// Small helper that talks to the NestJS backend.
// All requests go through the Vite dev proxy to http://localhost:3000.

const BASE = '/api/trades';

async function request(url, options) {
  const res = await fetch(url, options);
  if (!res.ok) {
    // Try to surface a helpful message from the backend, e.g. the
    // "result is locked" error.
    let message = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      if (data.message) {
        message = Array.isArray(data.message) ? data.message.join(', ') : data.message;
      }
    } catch {
      // response had no JSON body - keep the generic message
    }
    throw new Error(message);
  }
  return res.json();
}

// GET /api/trades?month=2026-08
export function fetchTrades(month) {
  return request(`${BASE}?month=${month}`);
}

// GET /api/trades?year=2026
export function fetchTradesYear(year) {
  return request(`${BASE}?year=${year}`);
}

// GET /api/trades/stats?month=2026-08
export function fetchStats(month) {
  return request(`${BASE}/stats?month=${month}`);
}

// GET /api/trades/stats?year=2026
export function fetchYearStats(year) {
  return request(`${BASE}/stats?year=${year}`);
}

// POST /api/trades
export function createTrade(payload) {
  return request(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

// PATCH /api/trades/:id  (edits the trade details, never the result)
export function updateTrade(id, payload) {
  return request(`${BASE}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

// PATCH /api/trades/:id/hide — soft-delete
export function hideTrade(id) {
  return request(`${BASE}/${id}/hide`, { method: 'PATCH' });
}

// PATCH /api/trades/:id/close
export function closeTrade(id, payload) {
  return request(`${BASE}/${id}/close`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}
