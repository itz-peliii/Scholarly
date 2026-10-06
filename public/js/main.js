import { $ } from './utils.js';
import { initExplorer, renderExplorer } from './explorer.js';
import { initTracker, renderTracker } from './tracker.js';

const render = () => { renderExplorer(); renderTracker(); };
document.addEventListener('statechange', render);

document.querySelectorAll('nav button').forEach((b) => b.addEventListener('click', () => {
  document.querySelectorAll('section').forEach((s) => (s.hidden = s.id !== 'v-' + b.dataset.v));
  document.querySelectorAll('nav button').forEach((x) => x.classList.toggle('on', x === b));
}));
$('#ddx').onclick = () => $('#dd').close();

// Tombol tema opsional: kalau tidak ada di HTML, bagian ini dilewati (tidak error).
const themeBtn = $('#theme');
if (themeBtn) {
  themeBtn.onclick = () => {
    const r = document.documentElement;
    const dark = r.dataset.theme ? r.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme:dark)').matches;
    r.dataset.theme = dark ? 'light' : 'dark';
    try { localStorage.setItem('sch_theme', r.dataset.theme); } catch {}
  };
}
try { const t = localStorage.getItem('sch_theme'); if (t) document.documentElement.dataset.theme = t; } catch {}

initExplorer(); initTracker(); render();