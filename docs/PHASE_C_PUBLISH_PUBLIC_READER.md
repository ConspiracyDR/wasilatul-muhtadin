# Phase C Publish + Public Firestore Reader

## 1. Publish Architecture

Phase C moves production reading content to Firestore published documents.

Admin flow:

```text
Edit Draft -> Save Draft -> Preview -> Publish -> Public Reader
```

Publish is explicit and requires browser confirmation. Save Draft never publishes automatically. If the editor has unsaved changes, Publish is blocked until the draft is saved.

Publish source:

```text
readingDrafts/{readingId}
readingDrafts/{readingId}/blocks/{blockId}
```

Publish destination:

```text
readings/{readingId}
readings/{readingId}/blocks/{blockId}
```

Implementation:

- `src/firebase/publish.ts`
- `publishDraftReading(readingId)` reloads the saved draft from Firestore, validates it, then writes published content.
- `AdminReadingEditorPage` shows Publish, publish progress, success/failure messages, last published version, and published time when available.

## 2. Firestore Published Structure

Published reading document:

```text
readings/{readingId}
  id
  slug
  title
  category
  description
  sortOrder
  blockCount
  version
  publishedAt
  updatedAt
```

First publish uses `version = 1`. Every successful publish increments from the previous published version.

Published block document:

```text
readings/{readingId}/blocks/{blockId}
  id
  order
  title
  arabic
  latin
  translation
  repeat
  note
```

## 3. Description Handling

`description` is optional metadata on the reading, not a religious reading block.

Publish preserves `description` exactly as entered by admin. No linguistic correction, normalization, or paraphrase is performed.

Public `ReadingPage` renders description after the sticky title/header context and before the first reading block. Empty or null descriptions render no container.

Visual behavior:

- smaller and subtler than Arabic text
- comfortable line-height
- preserves line breaks
- no card container
- no large empty spacing when absent

## 4. Block Handling

Blocks are published with explicit `order`. Public reading fetches blocks ordered by `order` and applies an id fallback only when order ties.

The renderer continues to use existing `ReadingPage` and `ReadingSection`; Phase C does not redesign the public reading UI.

## 5. Repeat Handling

Repeat remains:

```ts
number[] | null
```

Examples:

```json
null
[3]
[3, 6, 8]
```

Public rendering remains:

```text
×3
×3 / ×6 / ×8
```

Repeat value order is preserved.

## 6. Failure Safety

Publish uses one Firestore write batch for the reading document, all current blocks, and stale block deletions.

Safety properties:

- old published version is not deleted before replacement writes are prepared
- commit is atomic at Firestore batch level
- stale blocks from older publishes are deleted in the same batch
- if commit fails, the prior published content remains the last committed public version

V1 limit:

- Firestore write batch limit is 500 writes.
- Effective publish size is one reading doc plus current block writes plus stale block deletes.
- Larger future content sets may need chunked staging or a server-side publish function.

## 7. Public Query Strategy

Production public UI reads from:

```text
readings
readings/{readingId}/blocks
```

Home:

- loads published reading summaries from Firestore
- orders by `sortOrder`
- applies deterministic client fallback by title and id
- never loads drafts

Category:

- filters published summaries by category on the client
- categories remain `ratib`, `tawasul`, `tahlil`, `doa`

Reading:

- fetches one published reading by slug
- fetches blocks from its published `blocks` subcollection
- renders through the existing reader components

Legacy static/dev content remains only as a development aid and is not the production source of truth.

## 8. Offline Strategy

Phase C relies on the persistent Firestore local cache configured in Phase A.

Expected behavior:

```text
Device online -> open published content -> Firestore stores cache
Device offline -> previously loaded content can be read from local cache
Device offline with no cached content -> app shows first-load connection-needed state
```

Dynamic Firestore documents are not precached through Workbox.

## 9. Tests

Coverage added or updated:

- publish first version
- publish version increment
- description preserved in publish plan
- repeat single and multiple render behavior
- published block explicit ordering
- stale published block cleanup plan
- public reading description rendering
- empty description does not render empty UI
- public Home fetch from published readings
- Category filtering from published readings
- Reading page fetch by slug
- draft content not exposed in public UI tests
- offline first-load state
- existing reading preferences
- Firestore Rules public/admin access

Verification commands:

```text
npm.cmd run typecheck
npm.cmd test
npm.cmd run test:rules
npm.cmd run build
```

## 10. Real Device QA

Run local dev server on the network:

```bash
npm run dev -- --host
```

Open the shown LAN URL from the phone.

QA checklist:

- Home loads published readings from Firestore
- Category lists only published readings
- Reading page opens by slug
- description appears above first block
- empty description leaves no blank container
- Arabic uses Noto Naskh Arabic
- RTL and harakat render correctly
- Arabic default/min/max font sizes feel right
- Latin toggle works
- Arti toggle works
- repeat single and multiple values render correctly
- long text wraps without overlap
- spacing between blocks remains comfortable
- after one online load, the same reading remains available offline from Firestore cache

## 11. Known Limitations

- Publish is client-side admin batch publishing.
- Batch publish is limited by Firestore's 500-write batch limit.
- There is no server-side audit trail yet.
- There is no multi-admin approval workflow.
- There is no OCR, AI correction, audio, notifications, or Cloudflare deployment in this phase.
- Public UI shows minimal friendly error states and does not expose raw Firebase error text.

## 12. QA Typography Patch

Post-Phase C QA patch is documented in:

```text
docs/PHASE_C_QA_TYPOGRAPHY_PATCH.md
```

It adds clearer publish feedback, public Arabic presentation newline collapsing, and a temporary local Arabic font selector for HP comparison.
