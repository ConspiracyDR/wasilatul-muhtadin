# Cloudflare Deployment

## Workers Static Assets

Deployment target uses Cloudflare Workers Static Assets.

Static asset directory:

```text
./dist
```

SPA fallback is configured in `wrangler.jsonc`:

```json
{
  "assets": {
    "directory": "./dist",
    "not_found_handling": "single-page-application"
  }
}
```

Do not use `public/_redirects` for SPA fallback on this target. The legacy rule:

```text
/* /index.html 200
```

can be rejected as an infinite loop by Workers Static Assets.

## Direct Routes

After deployment, direct navigation should resolve through the SPA fallback:

```text
/
/admin/login
/admin
/kategori/ratib
/bacaan/{slug}
```

## Build

Run before deployment:

```text
npm.cmd run typecheck
npm.cmd test
npm.cmd run build
```
