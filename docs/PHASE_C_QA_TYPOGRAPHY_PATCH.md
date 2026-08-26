# Phase C QA Typography Patch

## Scope

This patch is a UX/typography QA update after Phase C. It does not add new content architecture or production deployment.

## Publish Feedback

Admin Publish feedback now has visible UI states:

- pending: Publish button is disabled and shows `Publishing...`
- success: visible banner says `Berhasil dipublish` and includes the published version
- failure: visible error alert shows a clear publish failure message

Success feedback is shown only after `publishDraftReading` resolves successfully.

## Arabic Responsive Wrapping

Arabic source text is still stored exactly as admin entered it.

The public presentation layer now collapses whitespace/newline runs before rendering Arabic text:

```text
AAA
BBB
CCC
```

renders visually as:

```text
AAA BBB CCC
```

The browser then wraps naturally based on available width.

Public Arabic CSS keeps:

- `direction: rtl`
- `text-align: right`
- `lang="ar"`
- normal responsive wrapping
- no forced source newline layout
- no source text mutation

Latin and Arti continue to preserve intentional line breaks.

## Arabic Font QA Selector

Reading Settings now includes a temporary local QA selector for Arabic font comparison:

- Scheherazade New
- Amiri
- Noto Naskh Arabic

The selection persists in localStorage with other reading preferences and does not change stored content.

Local/offline font packages:

- `@fontsource/scheherazade-new`
- `@fontsource/amiri`
- `@fontsource/noto-naskh-arabic`

The existing Arabic font-size slider continues to apply to all candidate fonts.

## Description

Phase C description rendering remains intact:

- description renders before the first reading block
- empty/null description renders no container

## Tests

Regression coverage includes:

- publish confirmation
- publish pending disabled state
- publish success feedback
- publish failure feedback
- Arabic presentation newline collapsing
- raw Arabic value not modified
- Arabic QA font preference persistence
- Reading Settings font selector behavior
- existing Latin, Arti, font-size, repeat tests

## Real Device QA

Run:

```bash
npm run dev -- --host
```

On phone, compare Arabic rendering at common widths:

- 360px
- 390px
- 430px
- desktop

Check:

- harakat clipping
- line height
- long Arabic wrapping
- no horizontal overflow
- description still appears before block one
- Latin/Arti toggles still work
- font-size slider still works across all three font candidates

## Known Limitation

The font selector is intentionally a QA/development control. No final font choice is locked in this patch.
