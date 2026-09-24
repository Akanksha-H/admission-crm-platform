const BASE = '/api';

export async function fetchMeta() {
  const res = await fetch(`${BASE}/meta`);
  return res.json();
}

export async function fetchLeads(filters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
  const res = await fetch(`${BASE}/leads?${params}`);
  return res.json();
}

export async function fetchLead(id) {
  const res = await fetch(`${BASE}/leads/${id}`);
  return res.json();
}

export async function createLead(data) {
  const res = await fetch(`${BASE}/leads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw json;
  return json;
}

export async function updateLead(id, data) {
  const res = await fetch(`${BASE}/leads/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function addNote(id, text, by) {
  const res = await fetch(`${BASE}/leads/${id}/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, by }),
  });
  return res.json();
}

export async function deleteLead(id) {
  const res = await fetch(`${BASE}/leads/${id}`, { method: 'DELETE' });
  return res.json();
}

export async function fetchDashboard() {
  const res = await fetch(`${BASE}/dashboard`);
  return res.json();
}
