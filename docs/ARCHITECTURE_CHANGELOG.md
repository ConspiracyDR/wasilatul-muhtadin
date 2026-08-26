# ARCHITECTURE CHANGELOG

## 2026-08-25 — Static Content -> Admin Firebase Editor

### Previous Direction
- GitHub/static JSON as production content source.
- No backend.
- No authentication.
- Content update required developer edit + deploy.

### Problem Discovered
Religious content source is scan/PDF with Arabic, Latin, and Indonesian translation. OCR/transcription fidelity is not reliable enough to safely automate approval.

### Product Decision
Pengelola akan memasukkan content sendiri per block melalui application editor:
- Arabic
- Latin
- Arti
- Repeat
- Note

### New Direction
- Public reader remains no-login PWA.
- Admin login becomes mandatory for editing.
- Firebase Authentication added.
- Cloud Firestore added.
- Draft/publish workflow added.
- Public app reads published data only.
- Content updates no longer require application redeploy.

### Superseded Decisions
Any older core doc statement saying:
- `NO BACKEND`
- `NO FIREBASE`
- `NO ADMIN/CMS`
- production GitHub JSON is the only source of truth

is superseded by the current revised core documentation.

Historical phase/test documents remain useful as implementation history only.

## 2026-08-26 — Phase C Publish + Public Firestore Reader

### Implemented Direction
- Admin Publish copies saved draft content from `readingDrafts` into public `readings`.
- Published content preserves reading `description`, explicit block `order`, and repeat arrays.
- Public Home, Category, and Reading pages use Firestore `readings` as production source.
- Persistent Firestore cache provides offline access after content has been loaded once.
- Static/dev fixtures remain only for development support, not production source of truth.

### Safety Note
Publish uses a single Firestore write batch so stale block cleanup and replacement writes commit atomically within Firestore batch limits.
