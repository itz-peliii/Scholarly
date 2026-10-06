# Scholarly – Academic Opportunity Tracker & AI Discovery Platform

Scholarly adalah platform web modern yang dirancang untuk membantu mahasiswa Indonesia menemukan, melacak, dan mengelola berbagai peluang akademik seperti **Beasiswa**, **Program Magang**, **Lomba**, dan **Pertukaran Pelajar (Exchange)** secara efisien.

---

## 🎯 Kebutuhan & Problem Statement

Mahasiswa sering kali kesulitan dalam memantau peluang pengembangan diri karena beberapa kendala utama:
- **Informasi Tersebar:** Peluang beasiswa, lomba, dan magang tersebar di berbagai platform tanpa terpusat.
- **Kesulitan Menilai Kelayakan:** Persyaratan spesifik seperti kualifikasi IPK (*GPA*) dan semester minimum sering kali terlewatkan.
- **Tenggat Waktu Meleset:** Tanpa sistem pelacakan (*tracker*) yang terstruktur, mahasiswa sering melewatkan batas waktu pendaftaran (*deadline*).

**Solusi Scholarly:** Menyediakan katalog terintegrasi, fitur pencarian cerdas berbasis Generative AI untuk merekomendasikan peluang nyata yang sedang dibuka, serta papan pelacakan status pendaftaran (*application tracker*).

---

## 🛠️ Keputusan Teknis (Technical Architecture & Decisions)

### 1. Stack Teknologi
- **Backend:** Node.js & Express.js (ES Modules).
- **Frontend:** Vanilla JavaScript (Modular ES Modules), HTML5, CSS3.
- **AI Integration:** Google Gemini API (`gemini-2.5-flash`).
- **Environment Management:** Native Node.js `--env-file` support.

### 2. Arsitektur Proxy Server & Keamanan API Key
- **Keputusan:** API Key Gemini **tidak pernah diekspos di sisi klien (frontend)**.
- **Implementasi:** Endpoint server Express (`/api/discover`) bertindak sebagai *secure reverse proxy*. Klien melakukan request ke backend lokal, lalu server berinteraksi aman dengan Gemini API menggunakan variabel lingkungan (`process.env.GEMINI_API_KEY`).
- **Pencegahan Kebocoran:** Kunci API dan variabel sensitif diisolasi di file `.env` dan diabaikan oleh kontrol versi menggunakan `.gitignore`.

### 3. Pemilihan Model AI & Manajemen Kuota
- **Model:** Menggunakan model aktif `gemini-2.5-flash` untuk respon yang cepat, stabil, dan hemat kuota.
- **Penanganan Quota Rate Limits:**
  - Menghilangkan *grounding tools* berat pada free-tier request guna mencegah error kuota.
  - Membatasi panjang input kueri (maksimal 80 karakter) untuk efisiensi token.
  - Mengimplementasikan *in-memory rate-limiting* sederhana di backend (jeda minimal 8 detik antar-request per IP) untuk mencegah transmisi spam.
- **Formatting Output:** Memaksa model Gemini mengembalikan format JSON *structured array* bersih agar mudah di-parse dan dirender langsung oleh komponen UI frontend.

### 4. Struktur Data & Modularitas Frontend
- Frontend dibangun dengan pendekatan komponen JavaScript modular (`main.js`, `explorer.js`, `ai.js`, `store.js`, `tracker.js`, `utils.js`) tanpa ketergantungan *framework* berat untuk menjaga performa tetap ringan dan cepat.

---

## 🚀 Fitur Utama

1. **AI Opportunity Discovery:** Cari peluang beasiswa, magang, lomba, atau exchange terkini yang disesuaikan dengan kueri pengguna menggunakan analitis AI.
2. **Katalog & Filter Interaktif:** Filter berdasarkan kategori, IPK minimum, dan semester aktif pengguna.
3. **Application Tracker:** Simpan dan kelola status aplikasi (Misal: *Saved*, *Applied*, *Interview*, *Accepted*).
4. **Respon JSON Terstruktur:** Integrasi AI yang menjamin kembalian data valid dengan bidang judul, penyelenggara, deskripsi singkat, serta link pendaftaran resmi.

---

## 📂 Struktur Proyek

```text
Scholarly/
├── public/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── ai.js
│   │   ├── explorer.js
│   │   ├── main.js
│   │   ├── store.js
│   │   ├── tracker.js
│   │   └── utils.js
│   └── index.html
├── .env.example
├── .gitignore
├── package.json
├── README.md
└── server.js