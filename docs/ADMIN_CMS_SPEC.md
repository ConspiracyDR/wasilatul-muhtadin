# ADMIN CONTENT EDITOR SPECIFICATION

## 1. Goal

Admin Content Editor memungkinkan pengelola memasukkan bacaan secara manual dengan akurasi penuh tanpa mengedit JSON/source code.

Editor menggunakan **block-based authoring**.

---

## 2. Access

Admin login wajib.

Public jamaah tidak login.

Recommended routes:

```text
/admin/login
/admin
/admin/bacaan/:readingId
```

---

## 3. Block-Based Authoring — Locked Requirement

Satu content block adalah satu pasangan lengkap:

- Arabic
- Latin
- Arti
- Repeat
- Note optional

Admin memasukkan content seperti:

```text
Block 1
[ Arabic textarea ]
[ Latin textarea ]
[ Arti textarea ]
[ Repeat ]

+ Tambah Blok

Block 2
[ Arabic textarea ]
[ Latin textarea ]
[ Arti textarea ]
[ Repeat ]
```

Jangan menggunakan satu field besar untuk keseluruhan bacaan.

Setiap block harus dapat diedit secara independen.

---

## 4. Repeat Input

Repeat merupakan metadata block.

Admin harus dapat menentukan jumlah bacaan sebagai array nilai repeat:

- tidak ada repeat
- satu nilai, misalnya `3x`
- beberapa nilai, misalnya `3x / 6x / 8x`
- nilai besar seperti `10x / 20x / 30x / 100x / 500x`

UI yang disarankan:

- preset cepat: `Tidak Ada`, `1x`, `3x`, `7x`
- mode Custom untuk beberapa angka
- Custom menyediakan list input angka yang dapat ditambah, diedit, dihapus, dan dipertahankan urutannya

Preset hanya shortcut.

Nilai final tetap `number[] | null`, dan setiap item wajib integer positif.

Reading page menampilkan contoh `×3` atau `×3 / ×6 / ×8`.

---

## 5. Block Actions

Minimal:

- Tambah Blok
- Edit
- Move Up
- Move Down
- Delete dengan confirmation

Drag and drop optional dan tidak boleh menjadi satu-satunya cara reorder.

---

## 6. Arabic Editor

Arabic textarea:

- RTL
- Noto Naskh Arabic / font reader yang sama
- ukuran relatif besar
- multiline
- harakat tidak terpotong
- plain text

Jangan auto-correct isi agama.

---

## 7. Latin dan Arti Editor

Latin:
- plain textarea
- LTR
- tidak auto-normalize transliteration

Arti:
- plain textarea
- LTR
- tidak auto-paraphrase

---

## 8. Save / Preview / Publish

Flow:

```text
Edit blocks
→ Save Draft
→ Preview
→ Publish
```

Preview harus memakai renderer public yang sama.

Draft tidak terlihat public.

Publish adalah explicit action dengan confirmation.

---

## 9. Validation

Per block:

- Arabic wajib untuk block bacaan standar
- Latin optional
- Arti optional
- Repeat null atau array integer positif
- Note optional

Jangan melakukan linguistic correction.

---

## 10. Not V1

- rich text editor
- OCR auto-import
- audio attachment
- collaborative editing
- comments/review workflow
- complex role hierarchy
