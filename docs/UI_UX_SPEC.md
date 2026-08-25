# UI / UX SPECIFICATION

## Design Goal
Aplikasi harus terasa modern, clean, hangat, dan tenang — bukan dashboard enterprise dan bukan website masjid lama yang padat ornamen. Prioritas tertinggi adalah kenyamanan membaca Arab di HP saat pengajian.

## Mobile First
Design mulai dari layar mobile kecil. Target utama Android dan iPhone. Tidak boleh ada horizontal page scrolling pada viewport normal.

## Visual Language
- whitespace cukup
- hierarchy jelas
- rounded surfaces boleh digunakan secara moderat
- hindari semua elemen dibungkus card
- hindari border/shadow berlebihan
- gunakan accent color untuk interaction/highlight, bukan memenuhi layar
- dekorasi islami jika digunakan harus subtil dan tidak mengurangi readability
- animasi/transisi singkat dan purposeful; hormati reduced-motion

## Home
Home harus cepat menjawab: “Saya mau baca apa?”

Tampilkan identitas Majelis secukupnya dan entry point bacaan yang jelas. V1 minimal memuat Tawasul, Ratib, Tahlil, dan Doa-doa. Struktur harus menerima kategori baru tanpa redesign.

Jangan membuat dashboard statistik, carousel promosi, atau widget yang tidak dibutuhkan.

## Reading View
Reading view jauh lebih minimal daripada Home.

Prioritas visual:
1. Arabic text
2. repeat indicator bila ada
3. navigation/context title
4. Latin/Arti controls
5. secondary metadata

### Arabic
- `dir="rtl"` dan semantics RTL benar
- ukuran besar dan responsif
- line-height lapang untuk harakat
- font Arab harus diuji dengan teks source nyata
- jangan truncate
- jangan justify yang merusak spacing
- contrast tinggi

Font final tidak dikunci di dokumen ini. Codex harus memilih kandidat web font/local asset yang legal dan performant lalu menguji glyph/harakat pada iOS Safari dan Android Chromium. Jangan bergantung pada font sistem yang hasilnya sangat berbeda tanpa testing.

### Latin & Arti
Default hidden. Sediakan dua control independen: `Latin` dan `Arti`. User boleh menampilkan salah satu atau keduanya.

State pilihan disimpan lokal dan berlaku konsisten ketika membuka bacaan lain.

Expanded content harus visually secondary dibanding Arab dan tetap mudah dibaca.

### Repetition
Jika source menyatakan pengulangan, render sebagai badge/indicator ringkas seperti `×3`, `×7`, dll. Jangan menaruh angka pengulangan di tengah Arabic text kecuali memang bagian literal dari source.

## Navigation
Tidak ada guided pengajian sequence. User memilih bacaan berdasarkan nama/menu. Reading page harus memiliki cara jelas untuk kembali tanpa membingungkan browser navigation.

## Touch & Accessibility
- touch target sekitar minimum 44px
- body/input text tidak terlalu kecil
- semantic buttons/links
- visible focus state
- contrast memadai
- jangan mengandalkan hover
- controls memiliki accessible label/state

## Dark Mode
Dark mode boleh didukung jika implementasinya sederhana dan hasil Arabic reading tetap baik. Jangan jadikan dark mode blocker V1. Jika dibuat, ikuti system preference dahulu dan pastikan contrast teks Arab/harakat teruji.

## Loading / Offline States
Jangan tampilkan blank screen. Jika offline tetapi cache tersedia, aplikasi langsung menggunakan content lokal. Jika update tersedia, feedback harus ringan dan tidak menghalangi jamaah membaca.

## Empty/Error State
Gunakan bahasa sederhana. Jangan expose stack trace/error teknis ke user.

## Branding
Branding Majelis Wasilatul Muhtadin terlihat terutama di Home/app shell. Reading view jangan dipenuhi logo/watermark.

## Anti-patterns
Jangan:
- membuat dashboard sidebar desktop sebagai basis mobile
- menggunakan glassmorphism berlebihan
- menggunakan gradient/dekorasi yang mengurangi contrast Arab
- membuat setiap section sebagai card berat
- menampilkan Latin dan arti default
- memakai animasi pada teks bacaan
- membuat bottom navigation dengan menu kosong hanya demi terlihat seperti app

## UX Acceptance
Prototype V1 harus nyaman digunakan satu tangan, kategori dapat ditemukan cepat, Arab menjadi focal point, toggle Latin/Arti jelas, dan halaman panjang tetap terasa ringan.