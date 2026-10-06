import { $, esc, fmt, cd, daysLeft, toast } from './utils.js';
import { state, commit, addOpps, removeOpp } from './store.js';
import { discover } from './ai.js';

const meets = (o) => {
  const g = parseFloat(state.prof.gpa), s = parseInt(state.prof.sem);
  return (isNaN(g) || g >= o.minGpa) && (isNaN(s) || s >= o.minSem);
};

export function renderExplorer() {
  const q = $('#q').value.trim().toLowerCase(), fc = $('#fc').value, so = $('#so').value;
  const fm = $('#fm').checked, fh = $('#fh').checked;
  const list = state.opps.filter((o) =>
    (!q || (o.title + ' ' + o.org + ' ' + o.desc).toLowerCase().includes(q)) && (!fc || o.cat === fc) &&
    (!fm || meets(o)) && (!fh || (daysLeft(o.deadline) ?? 0) >= 0));
  const dl = (o) => { const n = daysLeft(o.deadline); return n === null ? 9e5 : n < 0 ? 1e6 - n : n; };
  list.sort((a, b) => so === 'az' ? a.title.localeCompare(b.title) : so === 'nw' ? b.ts - a.ts : dl(a) - dl(b));

  const open = state.opps.filter((o) => (daysLeft(o.deadline) ?? 0) >= 0);
  $('#stats').innerHTML = [[open.length, 'peluang terbuka'], [open.filter((o) => o.deadline && daysLeft(o.deadline) <= 7).length, 'deadline ≤ 7 hari'],
    [open.filter(meets).length, 'sesuai profilmu'], [Object.keys(state.track).length, 'di tracker']].map(([n, t]) => `<div class="stat"><b>${n}</b>${t}</div>`).join('');

  $('#grid').innerHTML = list.length ? list.map((o) => {
    const [c, t] = cd(o.deadline), tr = state.track[o.id];
    return `<article class="card"><div class="row"><span class="badge">${o.cat}</span><span class="spacer"></span><span class="badge ${c}">${t}</span></div>
      <h3>${esc(o.title)}</h3><p class="org">${esc(o.org)} · ${fmt(o.deadline)}</p>
      <p class="req">Min. IPK ${o.minGpa.toFixed(2)} · Semester ≥ ${o.minSem}</p>
      ${meets(o) ? '' : '<p class="nomatch">Belum memenuhi kualifikasi profilmu</p>'}
      <div class="row" style="margin-top:auto"><button class="btn sm" data-detail="${o.id}">Detail</button>
      <button class="btn sm pri" data-save="${o.id}" ${tr ? 'disabled' : ''}>${tr ? 'Tersimpan' : 'Simpan'}</button>
      <span class="spacer"></span><button class="btn sm del" data-del="${o.id}" >Hapus</button></div></article>`;
  }).join('') : '<div class="empty">Belum ada peluang. Klik “Cari” untuk mulai.</div>';

  $('#src').hidden = !state.sources.length;
  $('#srcl').innerHTML = state.sources.map((s) => `<li><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.title || s.url)}</a></li>`).join('');
}

export function showDetail(id) {
  const o = state.opps.find((x) => x.id === id); if (!o) return;
  const [c, t] = cd(o.deadline);
  $('#ddc').innerHTML = `<div class="row"><span class="badge">${o.cat}</span><span class="badge ${c}">${t}</span></div>
    <h2 style="margin:8px 0 2px">${esc(o.title)}</h2><p class="org">${esc(o.org)}</p><p>${esc(o.desc) || '<i>Tanpa deskripsi.</i>'}</p>
    <p class="req">Deadline ${fmt(o.deadline)} · IPK ≥ ${o.minGpa.toFixed(2)} · Semester ≥ ${o.minSem}</p>
    ${o.ai ? '<p class="hint">Dicari AI via Google Search. Selalu cek ulang syarat &amp; deadline di situs resmi.</p>' : ''}
    <p><a class="btn pri" href="${esc(o.link)}" target="_blank" rel="noopener noreferrer">Buka Halaman Resmi ↗</a></p>`;
  $('#dd').showModal();
}

export function initExplorer() {
  $('#pg').value = state.prof.gpa; $('#ps').value = state.prof.sem;
  for (const id of ['q', 'fc', 'pg', 'ps', 'so', 'fm', 'fh']) {
    $('#' + id).addEventListener('input', () => {
      if (id === 'pg' || id === 'ps') { state.prof = { gpa: $('#pg').value, sem: $('#ps').value }; commit(); } else renderExplorer();
    });
  }
  $('#grid').addEventListener('click', (e) => {
    const d = e.target.closest('[data-detail]'), s = e.target.closest('[data-save]'), x = e.target.closest('[data-del]');
    if (d) showDetail(d.dataset.detail);
    if (s) { state.track[s.dataset.save] = { status: 'Saved', notes: '' }; commit(); toast('Disimpan ke Tracker'); }
    if (x && confirm('Hapus peluang ini dari daftar?')) removeOpp(x.dataset.del);
  });
  $('#ai').addEventListener('click', async (e) => {
    const b = e.currentTarget; b.disabled = true; b.textContent = 'Mencari…';
    try {
      const r = await discover({ cat: $('#fc').value, q: $('#q').value.trim() });
      state.sources = r.sources;
      const n = addOpps(r.items);
      toast(n ? `${n} peluang baru ditambahkan` : 'Tidak ada peluang baru ditemukan');
    } catch (err) { toast(err.message); } finally { b.disabled = false; b.textContent = 'Cari'; }
  });
}