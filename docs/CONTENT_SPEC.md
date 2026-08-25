# CONTENT SPECIFICATION

## Purpose
Menentukan model konten bacaan agar UI tidak hardcoded dan teks keagamaan tetap berada di bawah kontrol pengelola.

## Authority Rule
Source yang diberikan/disetujui pengelola adalah satu-satunya authority. Jangan auto-correct Arab/harakat/Latin/arti. Jangan mengambil pengganti dari internet. Jika hasil ekstraksi PDF meragukan, tandai `needs_review` dan jangan mengarang.

## Content Model
Pisahkan metadata bacaan dari blok isi. Implementasi boleh JSON/TypeScript data, tetapi struktur semantik minimal harus setara dengan:

```json
{
  "id": "ratib-al-haddad",
  "slug": "ratib-al-haddad",
  "title": "Ratib Al-Haddad",
  "category": "ratib",
  "version": 1,
  "source_note": "Source approved by Majelis",
  "sections": [
    {
      "id": "section-001",
      "title": null,
      "arabic": "[APPROVED SOURCE TEXT]",
      "latin": "[APPROVED SOURCE TEXT OR NULL]",
      "translation": "[APPROVED SOURCE TEXT OR NULL]",
      "repeat": 3,
      "note": null,
      "review_status": "approved"
    }
  ]
}
```

`latin`, `translation`, `repeat`, `title`, dan `note` harus optional. Jangan isi placeholder ke production.

## Categories
V1 wajib mendukung `tawasul`, `ratib`, `tahlil`, dan `doa`. Category registry harus mudah diperluas untuk `yasin`, `sholawat`, `maulid`, `dzikir`, dll tanpa mengubah reading component.

## Rendering Contract
- `arabic`: RTL, primary content.
- `latin`: optional collapsible content.
- `translation`: optional collapsible content.
- `repeat`: jika integer > 1, render badge/indicator terpisah; jangan disisipkan ke string Arab.
- `note`: informasi editorial yang memang diberikan pengelola, bukan komentar AI.

## Ordering
Urutan `sections` adalah urutan bacaan. Jangan sorting otomatis berdasarkan title/id.

## IDs
ID/slug harus stabil setelah dipublikasikan agar bookmark/link internal di masa depan tidak rusak. Gunakan lowercase kebab-case untuk machine IDs.

## Source & Review Workflow
1. Terima PDF/dokumen/source dari pengelola.
2. Buat transkripsi/digitalisasi sebagai draft.
3. Tandai bagian meragukan untuk review.
4. Cocokkan terhadap source asli.
5. Hanya konten berstatus approved yang dianggap final.
6. Revisi pengelola mengalahkan transkripsi sebelumnya.

## Scan PDF Rule
PDF scan tidak boleh diasumsikan memiliki text layer yang akurat. OCR/transkripsi hanya alat bantu. Hasilnya wajib divalidasi terhadap halaman sumber sebelum dianggap approved.

## Content/UI Separation
Reading component tidak boleh memiliki teks Ratib/Tahlil/Tawasul/Doa yang hardcoded. UI menerima structured content dan merendernya.

## Versioning
Setiap dokumen bacaan memiliki integer `version`. Naikkan ketika isi approved berubah. Versi ini untuk tracking/update, bukan versi agama/source.

## Validation
Implementasi sebaiknya memvalidasi minimal:
- unique `id`/`slug`
- `title` tidak kosong
- `sections` tidak kosong untuk content published
- setiap section memiliki `arabic` atau jenis konten valid yang secara eksplisit didukung
- `repeat` null atau integer positif
- `review_status` valid

Validation tidak boleh melakukan linguistic auto-correction.

## Future Compatibility
Model boleh dikembangkan untuk heading, separator, atau tipe blok lain jika source nyata membutuhkannya. Jangan membangun editor/CMS pada V1.