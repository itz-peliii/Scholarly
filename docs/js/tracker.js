import { $, esc, cd, toast } from './utils.js';
import { state, commit, STATUSES, replaceAll } from './store.js';
import { showDetail } from './explorer.js';

const LABEL = { Saved: 'Saved', Applied: 'Applied', Interview: 'Interview', Accepted: 'Accepted', Rejected: 'Rejected' };

export function renderTracker() {
  const ids = Object.keys(state.track).filter((id) => state.opps.some((o) => o.id === id));
  $('#tc').textContent = ids.length;
  $('#board').innerHTML = STATUSES.map((s) => {
    const items = ids.filter((id) => state.track[id].status === s);
    return `<div class="col" data-st="${s}"><h4>${LABEL[s]}<span class="badge">${items.length}</span></h4>${items.map((id) => {
      const o = state.opps.find((x) => x.id === id), [c, t] = cd(o.deadline);
      return `<div class="tcard" draggable="true" data-id="${id}"><b>${esc(o.title)}</b><p class="org">${esc(o.org)}</p>
        <span class="badge ${c}">${t}</span>
        <select data-sel="${id}" aria-label="Status">${STATUSES.map((x) => `<option ${x === s ? 'selected' : ''}>${x}</option>`).join('')}</select>
        <textarea data-note="${id}" placeholder="Catatan (mis. transkrip belum legalisir)">${esc(state.track[id].notes)}</textarea>
        <div class="row" style="margin-top:6px"><button class="btn sm" data-detail="${id}">Detail</button><span class="spacer"></span><button class="btn sm del" data-rm="${id}">Lepas</button></div></div>`;
    }).join('')}</div>`;
  }).join('');
}

export function initTracker() {
  const board = $('#board'); let drag = null;
  board.addEventListener('change', (e) => { const id = e.target.dataset.sel; if (id) { state.track[id].status = e.target.value; commit(); } });
  board.addEventListener('input', (e) => { const id = e.target.dataset.note; if (id) { state.track[id].notes = e.target.value; try { localStorage.setItem('sch_track', JSON.stringify(state.track)); } catch {} } });
  board.addEventListener('click', (e) => {
    const r = e.target.closest('[data-rm]'), d = e.target.closest('[data-detail]');
    if (r) { delete state.track[r.dataset.rm]; commit(); }
    if (d) showDetail(d.dataset.detail);
  });
  board.addEventListener('dragstart', (e) => { const c = e.target.closest('.tcard'); if (c) drag = c.dataset.id; });
  board.addEventListener('dragover', (e) => { const c = e.target.closest('.col'); if (c) { e.preventDefault(); c.classList.add('over'); } });
  board.addEventListener('dragleave', (e) => e.target.closest('.col')?.classList.remove('over'));
  board.addEventListener('drop', (e) => {
    e.preventDefault(); const c = e.target.closest('.col');
    if (c && drag && state.track[drag]) { state.track[drag].status = c.dataset.st; commit(); } drag = null;
  });
  $('#exp').onclick = () => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify({ opps: state.opps, track: state.track }, null, 1)], { type: 'application/json' }));
    a.download = 'scholarly-backup.json'; a.click();
  };
  $('#imp').onclick = () => $('#impf').click();
  $('#impf').onchange = async (e) => {
    try {
      const j = JSON.parse(await e.target.files[0].text());
      if (!Array.isArray(j.opps) || typeof j.track !== 'object') throw 0;
      replaceAll(j.opps, j.track); toast('Impor berhasil');
    } catch { toast('File tidak valid'); }
    e.target.value = '';
  };
}