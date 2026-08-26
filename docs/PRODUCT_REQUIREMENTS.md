# PRODUCT REQUIREMENTS — Majelis Wasilatul Muhtadin PWA

**Status:** Revised V1 Baseline — Admin Content Editor Architecture  
**Implementation Owner:** Codex  
**Product Decisions:** User + ChatGPT  
**Application Type:** Progressive Web App (PWA)

## 1. Product Overview
Majelis Wasilatul Muhtadin PWA adalah aplikasi bacaan digital mobile-first untuk jamaah Majelis Wasilatul Muhtadin.

Use case publik utama tetap sebagai pengganti/pendamping buku bacaan ketika pengajian berlangsung. Jamaah harus dapat membuka bacaan dengan cepat dari Android maupun iPhone tanpa login.

Perubahan arsitektur utama: V1 sekarang juga memiliki **Admin Content Editor** agar pengelola dapat memasukkan dan mengelola sendiri teks Arab, Latin, arti, repeat, dan catatan per blok tanpa mengedit JSON/GitHub secara manual.

Target awal sekitar maksimal 100 pengguna publik dan sangat sedikit admin/editor.

## 2. Product Principles
Prioritas:
1. Akurasi konten bacaan
2. Keterbacaan teks Arab
3. Kesederhanaan untuk jamaah
4. Editor konten yang mudah dan aman bagi pengelola
5. Offline reading setelah konten pernah tersedia di perangkat
6. UI/UX modern dan nyaman
7. Maintenance sederhana

Jangan mengorbankan akurasi konten demi otomatisasi OCR.

## 3. User Types
### Public Jamaah
- Tidak login.
- Hanya membaca konten **published**.
- Dapat memakai Latin/Arti toggle.
- Dapat menggunakan konten yang sudah tersimpan ketika offline.

### Admin / Editor
- Login wajib.
- Tidak ada self-registration di UI.
- Hanya akun yang secara eksplisit diberi hak admin yang boleh mengakses editor dan menulis Firestore.
- Dapat membuat/edit draft, menyusun urutan blok, preview, dan publish.

## 4. Platform
- PWA
- Android
- iPhone/iOS
- Browser mobile modern
- Add to Home Screen
- Mobile-first

Desktop tetap responsif, terutama agar Admin Editor nyaman digunakan, tetapi public reading tetap diprioritaskan untuk mobile.

## 5. Core Content V1
Wajib mendukung:
- Tawasul
- Ratib
- Tahlil
- Doa-doa

Arsitektur tetap content-driven dan dapat diperluas ke Yasin, Sholawat, Maulid, Dzikir, surat pilihan, atau kategori lain.

## 6. Religious Content Authority
Konten final hanya berasal dari materi yang dimasukkan/disetujui pengelola.

Aturan keras:
- Jangan auto-correct Arab/harakat/Latin/arti berdasarkan internet atau pengetahuan model.
- Jangan melakukan OCR otomatis lalu langsung publish.
- Admin/editor adalah authority untuk approval content.
- Teks yang belum diperiksa harus tetap draft.

## 7. Reading Experience
- Arab besar dan jelas sebagai fokus utama.
- Latin default hidden, show/hide independen.
- Arti default hidden, show/hide independen.
- Repeat dirender terpisah seperti `×3`, `×7`.
- Preferensi Latin/Arti disimpan lokal.
- Tidak ada guided sequence wajib.

## 8. Admin Content Editor
Admin Editor wajib mendukung minimal:
- Login admin.
- Daftar bacaan.
- Buat bacaan baru.
- Edit metadata bacaan.
- Tambah blok.
- Edit blok.
- Hapus blok dengan confirmation.
- Atur urutan blok.
- Field: Arabic, Latin, Translation, Repeat, Note.
- Preview tampilan publik.
- Save Draft.
- Publish.
- Draft tidak boleh terlihat oleh jamaah.

Editor harus mengutamakan data entry sederhana, bukan rich-text editor kompleks.

## 9. Backend
V1 sekarang menggunakan **Firebase** karena kebutuhan Admin Content Editor memang membutuhkan authentication dan remote content storage.

Approved direction:
- Firebase Authentication
- Cloud Firestore

Tidak dibutuhkan server API custom pada V1.

## 10. Authentication Boundary
Login hanya untuk Admin/Editor.

JANGAN membuat login mandatory untuk jamaah.

JANGAN membuat:
- public registration UI
- profile jamaah
- role system kompleks
- social/community account system

## 11. Draft / Publish Boundary
Draft dan published content harus dipisahkan secara jelas.

Public app **tidak boleh membaca draft**.

Recommended model: draft workspace terpisah dari published reading snapshot/collection agar editing content published tidak langsung mengubah bacaan jamaah sebelum admin menekan Publish.

## 12. Offline
PWA app shell tetap offline-capable.

Published content yang sudah pernah berhasil diambil harus dapat dibaca kembali saat offline melalui persistent local cache yang sesuai.

Admin editing membutuhkan koneksi online untuk write/publish pada V1. Offline admin editing tidak menjadi requirement.

## 13. Branding
V1 khusus **Majelis Wasilatul Muhtadin**. Branding tetap centralized/configurable agar core dapat digunakan kembali untuk Majelis lain di masa depan.

V1 tetap **bukan multi-tenant SaaS**.

## 14. Explicitly Out of Scope V1
- Login jamaah
- Public registration
- Multi-tenant SaaS
- Audio
- Notifikasi
- Kas Majelis
- Dokumentasi/foto
- Database jamaah
- Absensi
- Guided pengajian
- Native Android/iOS app
- Rich collaborative editor
- Real-time multi-admin collaboration
- OCR auto-publish

## 15. Acceptance Baseline
V1 dianggap memenuhi baseline jika:
- Public reader berjalan di Android/iPhone tanpa login.
- Admin login terproteksi.
- Hanya admin authorized yang dapat menulis content.
- Admin dapat membuat draft bacaan/blok.
- Admin dapat preview sebelum publish.
- Draft tidak bisa dibaca publik.
- Publish membuat versi terbaru tersedia ke public reader.
- Arabic/Latin/Arti/repeat dirender sesuai schema.
- Published content yang sudah pernah dimuat tetap dapat dibaca offline.
- UI public tetap modern, sederhana, dan fokus ke Arabic reading.
- Admin UI fungsional tetapi tidak mengubah public UI menjadi dashboard.
