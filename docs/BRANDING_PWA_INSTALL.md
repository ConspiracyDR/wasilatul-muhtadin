# Branding + PWA Install

## Primary Color

Primary brand color is locked to:

```text
#007979
```

Central tokens:

```text
--color-primary: #007979
--color-primary-hover
--color-primary-soft
--color-background
--color-surface
--color-text
--color-text-muted
--color-border
--color-danger
```

The app keeps the existing name:

```text
Majelis Wasilatul Muhtadin
```

## Logo And Icons

Logo/icon source remains the existing Majelis branding under:

```text
public/icons/
```

Audited assets:

```text
logo.png                 1254x1254
favicon-32.png             32x32
apple-touch-icon.png      180x180
icon-192.png              192x192
icon-512.png              512x512
maskable-icon-192.png     192x192
maskable-icon-512.png     512x512
```

No generic Vite icon path is referenced by the manifest or HTML branding config.

## Manifest Values

Manifest values are generated from `src/config/app-config.ts`.

```text
name: Majelis Wasilatul Muhtadin
short_name: Wasilatul Muhtadin
theme_color: #007979
background_color: #f7f4ec
display: standalone
start_url: /
scope: /
lang: id
```

Icons:

```text
/icons/icon-192.png
/icons/icon-512.png
/icons/maskable-icon-192.png
/icons/maskable-icon-512.png
```

## Android / Chromium Install Flow

The Home top area always keeps an `Install App` CTA discoverable unless the app is already running as an installed PWA.

Behavior:

- when Android/Chromium can install the app, user click triggers the native install prompt
- accepted install hides the CTA
- installed app state hides the CTA
- no prompt is shown automatically on page load

## iOS Safari Fallback

When iOS Safari is detected and the app is not already standalone, the Home CTA opens a short sheet:

```text
1. Tap Share
2. Pilih Add to Home Screen
3. Tap Add
```

The sheet is accessible as a dialog and can be dismissed.

## Unsupported Browser Fallback

If the current browser or local LAN address cannot show the native install prompt yet, the CTA still remains visible.

Clicking it opens a short sheet explaining:

```text
Install aplikasi tersedia melalui browser yang mendukung PWA.
Untuk hasil terbaik, buka aplikasi melalui Chrome di Android atau Safari di iPhone,
lalu gunakan Add to Home Screen.
```

Full install behavior is most reliable after deployment over HTTPS.

## Installed State Detection

Install CTA is hidden when:

- `display-mode: standalone` matches
- `navigator.standalone` is true on iOS
- the browser reports that the app was installed

Install UX does not reload the app and does not interfere with the existing PWA update prompt.

## Public UI Cleanup

Public UI avoids internal/technical labels such as:

- approved
- needs_review
- review_status
- fixture
- phase
- debug
- Firestore/cache terminology

Admin UI keeps useful operational words like Draft, Published, Saving, and Publishing.

## Tests

Coverage includes:

- primary brand color token/config
- app name remains unchanged
- manifest theme color config
- icon references and PNG dimensions
- Install App remains visible when native install is not available yet
- unsupported/browser fallback sheet
- install click triggers native prompt
- installed state hides CTA
- iOS Safari fallback instructions
- no technical labels leak to public Home/Category UI
- existing reading/admin behavior

Verification commands:

```text
npm.cmd run typecheck
npm.cmd test
npm.cmd run test:rules
npm.cmd run build
```

## Known Limitations

- Browser install prompt availability depends on browser PWA criteria.
- iOS fallback is a lightweight instruction sheet, not a native prompt.
- No Cloudflare deployment is included in this task.
