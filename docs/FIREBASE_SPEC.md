# FIREBASE ARCHITECTURE & SECURITY SPECIFICATION

## Services
V1 menggunakan:
- Firebase Authentication
- Cloud Firestore

Firebase Storage tidak diperlukan untuk text content V1. Static logo/icon tetap berada di app assets.

## Environment
Firebase web config disimpan melalui environment config yang sesuai tooling.

Jangan commit:
- admin password
- service account credential
- private keys
- secret server credential

Firebase web config sendiri bukan security boundary. Security wajib berada pada Firestore Rules dan admin authorization.

## Auth Method
Starting method: Email/Password.

Tidak ada public registration UI.

Admin account dapat dibuat/diatur secara manual melalui Firebase Console pada tahap bootstrap.

## Authorization Model
Gunakan admin document:

```text
admins/{uid}
```

Contoh minimal data:

```json
{
  "active": true
}
```

Authorization rule secara konsep:
- harus authenticated
- `admins/{request.auth.uid}` harus ada dan `active == true`

## Firestore Collections
Recommended:

```text
admins/{uid}
readingDrafts/{readingId}
readingDrafts/{readingId}/blocks/{blockId}
readings/{readingId}
readings/{readingId}/blocks/{blockId}
```

## Security Intent
### Public
- Boleh read `readings` dan published blocks.
- Tidak boleh write apa pun.
- Tidak boleh read `readingDrafts`.
- Tidak boleh read admin records.

### Authorized Admin
- Boleh read/write draft.
- Boleh read/write published content melalui admin UI/publish operation.
- Boleh membaca info authorization yang diperlukan secara aman.

### Non-admin Authenticated User
- Sama seperti public untuk published reading.
- Tidak memiliki draft/write privilege.

## Rules Testing
Sebelum dianggap selesai, rules harus diuji minimal terhadap:
- unauthenticated public read published => allow
- unauthenticated read draft => deny
- unauthenticated write => deny
- authenticated non-admin write => deny
- admin draft read/write => allow
- admin publish write => allow
- public admin-record read => deny

Gunakan Firebase Emulator Suite bila proporsional untuk rules tests.

## Publish Integrity
Jika publish melibatkan banyak document writes, gunakan Firestore batch/transaction yang sesuai dan tetap di bawah limit operasional.

Jika publish gagal di tengah preparation, published snapshot lama harus tetap tersedia.

Codex harus memilih strategi publish yang konsisten dan mendokumentasikan trade-off sebelum implementasi final.

## Offline Public Reading
Gunakan Firestore persistent local cache yang didukung SDK untuk published content, dengan graceful fallback bila persistence tidak tersedia.

Public reader harus:
- mencoba network ketika online
- dapat menggunakan cached published data setelah successful prior load
- menampilkan state yang jelas jika belum pernah mendapat content dan sedang offline

Admin writes pada V1 dianggap online-only.

## Indexes
Jangan membuat index spekulatif. Tambahkan hanya query/index yang benar-benar dibutuhkan.
