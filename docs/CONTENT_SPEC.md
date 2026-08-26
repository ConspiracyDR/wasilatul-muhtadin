# CONTENT SPECIFICATION — Firebase Editor Model

## Purpose
Menentukan model konten setelah perubahan dari static JSON-only menjadi Firebase-backed Admin Content Editor.

## Authority Rule
Admin/editor yang ditunjuk adalah authority isi bacaan. Aplikasi tidak melakukan linguistic auto-correction.

## Reading Metadata
Minimal:
- `id`
- `slug`
- `title`
- `category`
- `description` optional
- `version`
- `updatedAt`
- `publishedAt` optional

## Block Model
Setiap bacaan terdiri dari ordered blocks.

Minimal field per block:
- `id`
- `order`
- `title` optional
- `arabic`
- `latin` optional
- `translation` optional
- `repeat` optional array of positive integers: `number[] | null`
- `note` optional

Arabic/Latin/translation disimpan sebagai plain text. Jangan memakai HTML user-provided pada V1.

## Recommended Firestore Shape
Gunakan pemisahan draft dan published:

```text
readingDrafts/{readingId}
readingDrafts/{readingId}/blocks/{blockId}

readings/{readingId}
readings/{readingId}/blocks/{blockId}
```

`readingDrafts` hanya dapat dibaca/ditulis admin.

`readings` adalah snapshot published yang dapat dibaca publik.

## Why Separate Draft and Published
Editing draft tidak boleh langsung mengubah content jamaah. Publish adalah explicit action yang menyalin draft tervalidasi menjadi published snapshot.

## Categories
V1:
- `tawasul`
- `ratib`
- `tahlil`
- `doa`

Registry dapat diperluas tanpa mengubah generic reading renderer.

## Ordering
Order adalah explicit numeric field. Jangan mengandalkan document ID atau timestamp sebagai urutan bacaan.

Saat reorder, hasil harus deterministik dan tidak kehilangan blok.

## Validation
Sebelum Save/Publish:
- title wajib
- category valid
- setiap block punya unique id
- `order` valid
- `arabic` wajib untuk blok bacaan standar
- `repeat` null atau array berisi integer positif
- plain text only

Validation tidak boleh memperbaiki isi teks secara linguistik.

## Publish Validation
Publish hanya boleh berhasil jika seluruh draft valid.

Jika gagal:
- published snapshot lama tetap utuh
- tampilkan error yang jelas pada admin
- jangan melakukan partial publish diam-diam

## Deletion
Delete reading/block wajib confirmation.

Untuk published reading, deletion public harus merupakan explicit publish/removal action; menghapus draft tidak boleh otomatis menghapus published snapshot.

## Content Version
Published reading memiliki `version` integer yang naik setiap publish sukses.

Version digunakan untuk debugging/cache/update, bukan penanda versi agama.

## Repeat Model

Repeat bukan single number.

Gunakan:

```text
number[] | null
```

Contoh:

```json
"repeat": null
```

```json
"repeat": [3]
```

```json
"repeat": [3, 6, 8]
```

Urutan repeat values harus dipertahankan. Public renderer menampilkan repeat array sebagai `×3` atau `×3 / ×6 / ×8` sesuai urutan input admin.

## Migration From Existing JSON
Existing JSON/development fixtures boleh tetap digunakan hanya sebagai migration/testing input sementara.

Setelah Firebase editor menjadi authority runtime, jangan mempertahankan dua source of truth production yang saling bersaing.
