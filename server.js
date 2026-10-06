import express from 'express';

const app = express();
app.use(express.json({ limit: '10kb' }));
app.use(express.static('public'));

const CATS = ['Beasiswa', 'Magang', 'Lomba', 'Exchange'];
// Ganti menjadi versi model yang aktif:
const MODEL = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
const last = new Map(); // rate limit sederhana per IP

const isoDate = (s) => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s);
const httpUrl = (s) => typeof s === 'string' && /^https?:\/\//.test(s);

function clean(raw, today) {
  return (Array.isArray(raw) ? raw : []).flatMap((o) => {
    if (!o || !o.title || !o.org || !CATS.includes(o.cat) || !httpUrl(o.link)) return [];
    const deadline = isoDate(o.deadline) && o.deadline >= today ? o.deadline : null;
    if (isoDate(o.deadline) && !deadline) return []; // sudah lewat -> buang
    const g = Number(o.minGpa), s = parseInt(o.minSem);
    return [{
      title: String(o.title).slice(0, 120), org: String(o.org).slice(0, 80), cat: o.cat,
      minGpa: g >= 0 && g <= 4 ? Math.round(g * 100) / 100 : 0,
      minSem: s >= 1 && s <= 14 ? s : 1,
      deadline, desc: String(o.desc || '').slice(0, 500), link: o.link, ai: true,
    }];
  });
}

app.post('/api/discover', async (req, res) => {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return res.status(500).json({ error: 'GEMINI_API_KEY belum diset di .env' });
  if (Date.now() - (last.get(req.ip) || 0) < 8000) return res.status(429).json({ error: 'Tunggu beberapa detik.' });
  last.set(req.ip, Date.now());

  const cat = CATS.includes(req.body?.cat) ? req.body.cat : '';
  const q = String(req.body?.q || '').slice(0, 80);
  const today = new Date().toISOString().slice(0, 10);
  const prompt = `Hari ini ${today}. Gunakan Google Search untuk menemukan maksimal 15 peluang NYATA yang MASIH DIBUKA untuk mahasiswa S1 di Indonesia${cat ? `, kategori ${cat}` : ' (Beasiswa, Magang, Lomba, atau Exchange)'}${q ? `, terkait "${q}"` : ''}.
Aturan: hanya sertakan yang kamu temukan di hasil pencarian dengan link resmi penyelenggara/halaman pendaftaran. Jangan mengarang. Jika deadline tidak jelas, isi null. Jika syarat IPK/semester tidak jelas, isi 0 dan 1.
Balas HANYA JSON array tanpa teks lain, tiap item: {"title":"","org":"","cat":"Beasiswa|Magang|Lomba|Exchange","minGpa":0,"minSem":1,"deadline":"YYYY-MM-DD atau null","desc":"ringkas, bahasa Indonesia","link":"https://..."}`;

  try {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    });
    const data = await r.json();
    if (!r.ok) return res.status(502).json({ error: data.error?.message || 'Gemini error' });
    const cand = data.candidates?.[0];
    const text = (cand?.content?.parts || []).map((p) => p.text || '').join('');
    const m = text.match(/\[[\s\S]*\]/);
    const items = m ? clean(JSON.parse(m[0]), today) : [];
    const sources = (cand?.groundingMetadata?.groundingChunks || [])
      .filter((c) => c.web?.uri).map((c) => ({ title: c.web.title, url: c.web.uri })).slice(0, 8);
    res.json({ items, sources });
  } catch (e) {
    res.status(500).json({ error: 'Gagal memproses respons AI: ' + e.message });
  }
});

app.listen(process.env.PORT || 3000, () => console.log('Scholarly jalan di http://localhost:' + (process.env.PORT || 3000)));