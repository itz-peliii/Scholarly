export const $ = (s) => document.querySelector(s);
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const todayStr = () => { const d = new Date(); return new Date(d - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10); };
export const daysLeft = (d) => d ? Math.round((new Date(d + 'T00:00:00') - new Date(todayStr() + 'T00:00:00')) / 864e5) : null;
export const fmt = (d) => d ? new Date(d + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Deadline belum diketahui';
export function cd(d) {
  const n = daysLeft(d);
  if (n === null) return ['cd-off', 'Cek situs resmi'];
  if (n < 0) return ['cd-off', 'Ditutup'];
  if (n === 0) return ['cd-bad', 'Hari ini!'];
  return [n <= 7 ? 'cd-bad' : n <= 21 ? 'cd-warn' : 'cd-ok', n + ' hari lagi'];
}
export function toast(m) {
  const t = $('#toast'); t.textContent = m; t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2200);
}