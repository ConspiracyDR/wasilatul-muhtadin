# Majelis Wasilatul Muhtadin

PWA bacaan Majelis Wasilatul Muhtadin dengan public reader, admin draft editor, publish flow ke Firestore, dan dukungan install app.

## Stack

- React
- TypeScript
- Vite
- Firebase Auth
- Cloud Firestore
- Vite PWA
- Cloudflare Workers Static Assets

## Setup

Install dependencies:

```bash
npm install
```

Copy Firebase env:

```bash
copy .env.example .env.local
```

Isi `.env.local` dengan konfigurasi Firebase project.

## Development

```bash
npm run dev
```

Untuk test di HP lewat jaringan lokal:

```bash
npm run dev -- --host
```

## Quality Checks

```bash
npm run typecheck
npm test
npm run build
```

Firestore rules tests:

```bash
npm run test:rules
```

## Build

```bash
npm run build
```

Output production ada di:

```text
dist/
```

## Cloudflare

Project memakai Cloudflare Workers Static Assets.

Config utama:

```text
wrangler.jsonc
```

SPA fallback memakai:

```json
{
  "assets": {
    "directory": "./dist",
    "not_found_handling": "single-page-application"
  }
}
```

Tidak perlu `public/_redirects`.

## Content Flow

Admin membuat dan menyimpan draft, lalu melakukan publish secara eksplisit. Public reader hanya membaca konten published dari Firestore.

## Notes

- Jangan commit `.env` atau `.env.local`.
- Jangan commit `dist/`, `node_modules/`, `audit/`, `tmp/`, atau source PDF lokal.
- Dokumentasi internal project disimpan lokal dan tidak ikut Git.
