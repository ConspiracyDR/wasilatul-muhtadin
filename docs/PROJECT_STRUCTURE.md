# PROJECT STRUCTURE — PROPOSED CONTRACT

> Ini logical structure, bukan perintah framework-specific. Codex boleh menyesuaikan nama folder dengan stack yang dipilih selama separation of concerns dipertahankan.

```text
/
├─ docs/
│  ├─ PRODUCT_REQUIREMENTS.md
│  ├─ CONTENT_SPEC.md
│  ├─ UI_UX_SPEC.md
│  ├─ PWA_OFFLINE_SPEC.md
│  ├─ IMPLEMENTATION_RULES.md
│  └─ PROJECT_STRUCTURE.md
├─ public/
│  └─ app icons / static public assets
├─ src/
│  ├─ app/                 # routes/app composition
│  ├─ components/          # reusable UI
│  ├─ content/             # approved structured reading content
│  │  ├─ tawasul/
│  │  ├─ ratib/
│  │  ├─ tahlil/
│  │  └─ doa/
│  ├─ config/              # Majelis branding/app config
│  ├─ features/reading/    # reading-specific behavior
│  ├─ lib/                 # small shared utilities/validation
│  └─ styles/              # global tokens/typography if needed
└─ tests/                   # if stack convention does not colocate tests
```

## Boundaries
`content/` tidak bergantung pada UI components. Reading UI tidak mengetahui detail Ratib tertentu. Branding config tidak disalin ke setiap component.

## Content Registry
Sediakan registry/index yang menentukan kategori dan bacaan published sehingga Home/navigation dapat dibentuk dari data, bukan daftar hardcoded tersebar.

## Assets
Logo Majelis dan PWA icons adalah assets. Jangan embed base64 ke source tanpa alasan. Arabic web font bila self-hosted harus memiliki lisensi yang sesuai dan subset/weight secukupnya.

## Naming
Gunakan naming konsisten, machine ID kebab-case untuk content, dan nama component/function mengikuti convention stack yang dipilih.

## Growth Rule
Buat folder baru karena kebutuhan nyata, bukan untuk meniru enterprise architecture. V1 kecil; struktur harus mudah dipahami satu developer.