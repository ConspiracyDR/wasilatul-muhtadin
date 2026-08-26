# PWA / OFFLINE SPECIFICATION — Firebase Runtime

## Objective
Public reader tetap dapat membaca published content yang sudah pernah berhasil dimuat meskipun koneksi internet kemudian hilang.

## App Shell
Tetap gunakan PWA service worker untuk:
- HTML/app shell
- JS/CSS
- icons
- fonts
- static assets

Update tetap memakai prompt, bukan forced auto reload saat user membaca.

## Content Data
Published religious content sekarang berasal dari Firestore, bukan bundled JSON production sebagai source of truth utama.

Gunakan persistent local cache Firestore/IndexedDB mechanism yang didukung SDK untuk published data.

Jangan mencoba memasukkan dynamic Firestore documents ke Workbox precache secara manual.

## Public Offline Flow
### Pernah online dan content cached
- app shell terbuka
- published readings yang pernah dimuat dapat dibaca
- Latin/Arti preference bekerja

### First visit offline
Tampilkan state sederhana bahwa koneksi dibutuhkan sekali untuk memuat bacaan.

## Admin Offline
Admin editing offline bukan requirement V1.

Jika admin offline:
- jangan menjanjikan Save/Publish berhasil
- tampilkan state network yang jelas
- jangan kehilangan teks form secara sengaja ketika request gagal

## App Update vs Content Update
Pisahkan konsep:

### App update
GitHub -> Cloudflare Pages -> service worker update prompt.

### Content update
Admin Publish -> Firestore -> public app memperoleh published data terbaru ketika online -> cache lokal diperbarui.

Public tidak perlu redeploy app hanya untuk perubahan bacaan.

## Failure Safety
- App deployment gagal tidak menghapus cached app lama.
- Firestore fetch gagal tidak menghapus cached published content yang valid.
- Publish gagal tidak merusak published snapshot sebelumnya.
