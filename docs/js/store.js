const read = (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } };
const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

export const state = {
  opps: read('sch_opps', []),
  track: read('sch_track', {}), // { oppId: { status, notes } }
  prof: read('sch_prof', { gpa: '', sem: '' }),
  sources: [],
};
export const STATUSES = ['Saved', 'Applied', 'Interview', 'Accepted', 'Rejected'];

export function commit() {
  write('sch_opps', state.opps); write('sch_track', state.track); write('sch_prof', state.prof);
  document.dispatchEvent(new Event('statechange'));
}
export function addOpps(items) {
  const norm = (u) => u.replace(/\/+$/, '').toLowerCase();
  const seen = new Set(state.opps.map((o) => norm(o.link)));
  let n = 0;
  for (const it of items) {
    if (seen.has(norm(it.link))) continue;
    seen.add(norm(it.link));
    state.opps.push({ ...it, id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), ts: Date.now() });
    n++;
  }
  commit();
  return n;
}
export function removeOpp(id) {
  state.opps = state.opps.filter((o) => o.id !== id);
  delete state.track[id];
  commit();
}
export const replaceAll = (opps, track) => { state.opps = opps; state.track = track; commit(); };