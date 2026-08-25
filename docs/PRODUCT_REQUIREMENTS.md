# PRODUCT REQUIREMENTS — Majelis Wasilatul Muhtadin PWA

**Status:** V1 Baseline  
**Implementation Owner:** Codex  
**Product Decisions:** User + ChatGPT  
**Application Type:** Progressive Web App (PWA)

## 1. Product Overview
Majelis Wasilatul Muhtadin PWA adalah aplikasi bacaan digital mobile-first untuk jamaah Majelis Wasilatul Muhtadin. Use case utama adalah sebagai pengganti atau pendamping buku bacaan saat pengajian. Target awal sekitar maksimal 100 pengguna.

## 2. Product Principles
Prioritas: akurasi konten, keterbacaan Arab, kemudahan penggunaan, offline capability, UI/UX modern, maintenance sederhana, dan ekspansi konten.

## 3. Platform
V1 wajib PWA untuk Android dan iPhone/iOS, dapat dibuka dari browser dan ditambahkan ke Home Screen. Desktop tetap responsif tetapi bukan prioritas.

## 4. Core Content V1
Wajib tersedia:
- Tawasul
- Ratib
- Tahlil
- Doa-doa

Arsitektur harus content-driven dan dapat ditambah kemudian dengan Yasin, sholawat, maulid, dzikir, surat pilihan, atau bacaan lain tanpa redesign core.

## 5. Religious Content Authority
Semua teks keagamaan hanya berasal dari materi yang diberikan/disetujui pengelola. Codex dilarang mengoreksi atau mengganti teks Arab, harakat, transliterasi, terjemahan, jumlah pengulangan, atau urutan berdasarkan internet/asumsi. Source ambigu harus ditandai untuk review.

## 6. Reading Experience
- Arab besar dan jelas sebagai default/fokus utama.
- Latin hidden by default dan dapat show/hide.
- Arti hidden by default dan dapat show/hide secara independen.
- Pengulangan ditampilkan sebagai elemen UI seperti `×3`, `×7`.
- Preferensi Latin/Arti disimpan lokal tanpa akun.
- Tidak ada guided sequence; user memilih bacaan sendiri dari menu.

## 7. UI/UX Direction
Modern, clean, tenang, hangat, mobile-first, tidak kaku seperti dashboard enterprise. Gunakan whitespace dan hierarchy yang baik. Card boleh digunakan tetapi jangan menjadikan UI sekumpulan kotak. Animasi ringan hanya bila membantu. Home boleh lebih beridentitas; reading view harus minimal dan fokus.

Teks Arab adalah prioritas visual tertinggi: RTL benar, font jelas, harakat terbaca, line-height nyaman, tidak terpotong, dan diuji dengan konten nyata.

## 8. Branding
V1 khusus **Majelis Wasilatul Muhtadin**, tetapi branding harus terpusat/configurable (nama, logo, nama aplikasi, info singkat, theme values) agar core dapat digunakan ulang untuk Majelis lain. V1 bukan multi-tenant SaaS.

## 9. Authentication
Tidak ada login, register, profile, role, atau permission pada V1.

## 10. Offline & Updates
App shell, aset penting, font, dan konten bacaan harus tersedia offline setelah berhasil dimuat. Jika offline, versi lokal tetap usable. Ketika online dan versi baru tersedia, aplikasi mengambil update dan versi terbaru kemudian kembali usable offline.

GitHub repository adalah source of truth V1. Workflow: edit source/content → commit/push → deploy → client mendapat update ketika online.

## 11. Backend
Jangan menambahkan Firebase/backend pada V1 tanpa requirement baru. Tidak ada kebutuhan login, user data, CMS, realtime data, atau transaksi. Struktur tetap harus memungkinkan remote content/backend di masa depan tanpa rewrite besar reading UI.

## 12. Explicitly Out of Scope V1
- Login/akun
- CMS/admin dashboard
- Firebase/backend
- Audio
- Notifikasi
- Kas Majelis
- Dokumentasi/foto
- Database jamaah/absensi
- Guided pengajian
- Multi-tenant SaaS
- Native Android/iOS app

## 13. V2 Possibilities — NOT V1 REQUIREMENTS
Jadwal, pengumuman, dokumentasi, informasi Majelis, CMS, notifikasi, data jamaah, administrasi, audio.

## 14. Acceptance Baseline
V1 harus berjalan baik di Android/iPhone, tanpa login, menyediakan struktur Ratib/Tawasul/Tahlil/Doa, Arab jelas, toggle Latin/Arti, indikator pengulangan, local preference, offline reading, online update, centralized branding, dan UI modern. Jangan memasukkan fitur V2 tanpa requirement baru.

## 15. Codex Rule
Dokumen ini baseline produk. Jangan memperluas scope atau mengganti keputusan produk. Jika keputusan teknis besar belum ditentukan, jelaskan pilihan/trade-off terlebih dahulu. Baca juga seluruh dokumen di `/docs` sebelum implementasi.