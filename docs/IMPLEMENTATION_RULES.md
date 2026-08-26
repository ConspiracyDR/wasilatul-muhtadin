# IMPLEMENTATION RULES — CODEX

## Read First
Baca seluruh current core docs sebelum coding:
- `PRODUCT_REQUIREMENTS.md`
- `CONTENT_SPEC.md`
- `ADMIN_CMS_SPEC.md`
- `FIREBASE_SPEC.md`
- `UI_UX_SPEC.md`
- `PWA_OFFLINE_SPEC.md`
- `TECHNICAL_PLAN.md`
- `PROJECT_STRUCTURE.md`

Historical Phase/PDF transcription docs adalah context/history, bukan current architecture authority jika bertentangan dengan core docs terbaru.

## Architecture Change
Static JSON-only production content architecture sudah superseded.

Current production direction:
- public PWA reader
- Firebase Auth for admin
- Firestore content backend
- admin draft editor
- explicit publish
- public reads published content only

## Scope Discipline
Jangan menambahkan:
- public login
- public registration UI
- multi-tenant
- complex RBAC
- custom API server
- OCR auto-publish
- rich text editor
- V2 community/admin features

## Security
UI route protection bukan security boundary.

Firestore Rules wajib enforce:
- public cannot read drafts
- public cannot write
- authenticated non-admin cannot write
- authorized admin can manage content

Jangan hardcode admin password/secret.

## Content Integrity
Jangan auto-correct Arab/Latin/arti.

Editor menyimpan plain text yang dimasukkan admin.

Preview harus memakai renderer public yang sama agar tidak ada mismatch.

## Migration Discipline
Jangan menghapus existing static foundation secara brutal sebelum Firebase replacement bekerja dan tests lulus.

Lakukan migration incremental dengan rollback-friendly changes.

## Testing Priority
- auth guard behavior
- Firestore rules
- draft/public separation
- editor validation
- publish behavior
- public reading
- persistent cache/offline
- existing Latin/Arti preference
- PWA update behavior

## Completion Protocol
Setiap task selesai:
1. Completion report.
2. Update relevant docs.
3. Run tests/typecheck/build.
4. Buat/overwrite audit ZIP:
   `C:\wasilatul-muhtadin\audit\wasilatul-muhtadin-latest.zip`
5. Exclude `node_modules`, `dist`, `.git`, secrets, private env files.
6. Report exact ZIP path dan size.

Jangan lanjut ke phase berikut tanpa approval jika task menyatakan STOP.
