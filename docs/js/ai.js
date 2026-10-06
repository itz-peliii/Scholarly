// Memanggil backend (server.js) — API key Gemini TIDAK pernah ada di browser.
export async function discover({ cat, q }) {
  const res = await fetch('/api/discover', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cat, q }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Gagal menghubungi server');
  return data;
}