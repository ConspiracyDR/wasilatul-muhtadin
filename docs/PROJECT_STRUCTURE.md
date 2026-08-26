# PROJECT STRUCTURE — REVISED FIREBASE ARCHITECTURE

Logical target structure:

```text
/
├─ docs/
├─ public/
│  └─ icons, fonts/static assets
├─ src/
│  ├─ app/
│  │  ├─ public routes
│  │  └─ admin routes
│  ├─ components/
│  ├─ config/
│  │  ├─ app-config
│  │  └─ firebase-config adapter
│  ├─ features/
│  │  ├─ reading/
│  │  ├─ auth/
│  │  └─ admin-content/
│  ├─ firebase/
│  │  ├─ client initialization
│  │  ├─ auth helpers
│  │  ├─ reading repositories
│  │  └─ cache/error helpers
│  ├─ content/
│  │  ├─ types/schema
│  │  └─ legacy/migration fixtures only if still needed
│  ├─ styles/
│  └─ main.tsx
├─ firebase/
│  ├─ firestore.rules
│  └─ firestore.indexes.json if needed
├─ tests/
├─ .env.example
├─ vite.config.ts
└─ package.json
```

## Boundaries
- Public reading components tidak import admin UI.
- Admin editor memakai shared content schema dan shared Reading renderer untuk preview.
- Firebase access dibungkus repository/helper sederhana; jangan sebarkan raw Firestore calls ke semua component.
- `src/content` bukan lagi production source of truth setelah migration Firebase selesai.
- Branding tetap centralized.

## Growth Rule
Jangan menambahkan layer enterprise seperti service/domain/repository/usecase bertingkat tanpa kebutuhan nyata. Satu thin Firebase data layer cukup.
