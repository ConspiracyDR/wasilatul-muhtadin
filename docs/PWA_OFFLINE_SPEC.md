# PWA / OFFLINE SPECIFICATION

## Objective
Aplikasi harus dapat digunakan untuk membaca konten utama tanpa internet setelah asset/content berhasil tersedia di perangkat. Internet terutama diperlukan untuk memperoleh deployment/update terbaru.

## Architecture Principle
V1 static/content-driven. Jangan menambahkan Firebase/backend hanya untuk update konten.

## Source of Truth
GitHub repository adalah source of truth untuk application source dan approved content. Hosting/deployment dapat ditentukan pada implementasi, dengan syarat mendukung HTTPS dan PWA dengan baik.

## Required PWA Pieces
- valid web app manifest
- installable metadata/icons
- service worker atau equivalent build-tool PWA mechanism
- offline app shell
- caching strategy yang deterministic
- update handling yang tidak merusak sesi membaca

## Cache Categories
### Precache / App Shell
Cache asset penting yang dibutuhkan untuk membuka aplikasi:
- HTML entry/app shell
- compiled CSS/JS
- icons
- essential local font assets bila digunakan
- minimum navigation assets

### Reading Content
Approved V1 reading content harus tersedia offline. Karena mayoritas teks, prioritaskan reliability daripada lazy network dependency.

### Non-essential Future Media
Foto/audio future tidak boleh otomatis diprecache tanpa keputusan baru karena dapat membengkakkan storage.

## Offline Behavior
Jika user offline dan cache/content valid tersedia:
- app harus terbuka
- navigation ke bacaan cached bekerja
- Latin/Arti toggle bekerja
- local preferences bekerja
- jangan tampilkan blocking network error

Jika first-ever visit terjadi tanpa cache dan tanpa internet, tampilkan state sederhana bahwa aplikasi perlu dibuka sekali dengan internet.

## Update Behavior
Deployment baru tidak boleh langsung menghancurkan versi yang sedang dibaca.

Desired flow:
1. client membuka versi cached
2. ketika online, browser/service worker mengecek deployment terbaru
3. asset/content baru diambil sesuai strategy
4. update diaktifkan secara aman
5. versi baru tersedia untuk penggunaan berikutnya atau melalui lightweight update action

Jangan membuat aggressive reload ketika jamaah sedang membaca.

## Content Version
Structured content memiliki version sendiri. Application build juga harus memiliki build/release identifier yang dapat digunakan untuk debugging update.

## Local Preferences
Latin/Arti visibility dan preference ringan lain disimpan lokal (mis. localStorage atau storage sederhana yang sesuai). Tidak perlu sync/cloud.

## Cache Invalidation
Gunakan versioned build assets/hash dari tooling jika tersedia. Hindari cache key manual yang mudah stale. Pastikan deploy baru dapat mengganti stale app shell tanpa membuat offline mode rusak.

## Network Strategy Guidance
Codex boleh memilih strategy berdasarkan framework/tooling, tetapi hasil perilakunya wajib memenuhi requirement ini. Untuk static versioned assets biasanya cache-first/precache sesuai. Untuk update metadata/version check gunakan network-aware strategy yang tidak menjadi dependency reading.

## Testing Matrix
Minimal uji:
- Android Chromium online first load
- Android offline reopen
- iPhone Safari online first load
- iPhone added-to-home-screen bila memungkinkan
- iPhone offline reopen
- update dari build A ke build B
- offline ketika update gagal di tengah jalan
- toggle preference setelah browser/app ditutup dan dibuka kembali

## Failure Safety
Update gagal tidak boleh menghapus versi cached terakhir yang valid sebelum replacement siap.

## Storage
Konten teks diperkirakan kecil. Jangan melakukan premature optimization storage. Tetap hindari caching media besar yang tidak diperlukan.

## Backend Boundary
Jika V2 membutuhkan CMS/realtime data, desain update content dapat dievaluasi ulang. Jangan membangun abstraction backend generik di V1 tanpa kebutuhan.