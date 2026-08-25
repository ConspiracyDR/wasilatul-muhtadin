# IMPLEMENTATION RULES — CODEX

## Purpose
Guardrail implementasi agar Codex mengikuti keputusan produk dan tidak memperluas scope sendiri.

## Before Coding
Baca seluruh dokumen:
- `docs/PRODUCT_REQUIREMENTS.md`
- `docs/CONTENT_SPEC.md`
- `docs/UI_UX_SPEC.md`
- `docs/PWA_OFFLINE_SPEC.md`
- dokumen teknis lain yang ditambahkan kemudian

Jika dokumen konflik, jangan memilih sendiri. Laporkan konflik.

## Scope Discipline
Implementasikan hanya V1. Jangan menambahkan fitur V2 “sekalian”. Jangan membuat backend, Firebase, auth, CMS, analytics, database jamaah, notification system, audio system, atau multi-tenancy tanpa instruksi baru.

## Religious Content Safety
Codex bukan authority konten.
- Jangan auto-correct teks Arab/harakat.
- Jangan mengganti transliterasi/arti.
- Jangan browsing source lain untuk “memperbaiki” konten.
- Jangan mengisi bagian source yang tidak terbaca dengan tebakan.
- Gunakan placeholder development yang jelas jika approved content belum tersedia.
- Production content harus berasal dari approved source.

## Architecture
- content-driven
- separation UI/content/config
- branding terpusat
- components reusable secukupnya
- no premature abstraction
- no speculative multi-tenant architecture
- no unnecessary state-management library

Pilih dependency hanya jika memberi manfaat nyata. Prefer platform/framework capability yang stabil daripada library kecil untuk hal sederhana.

## Framework Decision
Framework belum dikunci oleh product requirement. Sebelum scaffolding besar, Codex harus mengusulkan stack PWA yang sederhana dan menjelaskan singkat alasan, trade-off, deployment target, PWA tooling, serta Arabic/RTL support. Jangan memilih stack hanya karena populer.

## UI Implementation
Ikuti `UI_UX_SPEC.md`. Jangan mengubah app menjadi dashboard template. Gunakan real structured sample content untuk menguji long Arabic text/harakat/RTL sebelum UI dianggap selesai.

## Offline
Offline bukan enhancement opsional; ini core requirement. Implementasi dianggap belum selesai jika UI bekerja online tetapi reading content gagal ketika offline setelah successful first load.

## Data
Jangan hardcode religious content dalam JSX/component/template. Gunakan structured content files/model sesuai `CONTENT_SPEC.md`.

## Configuration
Nama Majelis/logo/theme metadata diletakkan di config terpusat. Jangan membuat tenant database.

## Testing
Tambahkan testing yang proporsional. Prioritaskan:
- content schema/validation
- navigation
- Latin/Arti state
- RTL rendering sanity
- offline/update behavior
- responsive smoke tests bila tooling memungkinkan

Jangan membuat test infrastructure lebih kompleks daripada aplikasi.

## Change Discipline
Saat requirement berubah:
1. identifikasi dokumen yang terdampak
2. update spec bila diminta
3. implementasikan perubahan terkecil yang benar
4. jangan refactor area tidak terkait tanpa alasan

## Completion Report
Setelah task implementasi, Codex harus melaporkan singkat:
- apa yang dibuat/diubah
- file utama
- test yang dijalankan dan hasilnya
- keputusan/asumsi teknis
- known limitation/TODO yang benar-benar relevan

Jangan menyatakan selesai jika test penting gagal atau requirement offline belum diverifikasi.