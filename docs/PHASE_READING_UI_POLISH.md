# Phase Reading UI Polish

## UI Changes

Reading Mode sekarang dipisahkan secara visual dari Home dan Category:
- Home tetap menjadi navigasi Majelis dengan kategori Ratib, Tawasul, Tahlil, dan Doa-doa.
- Reading Page memakai header minimal berisi back button, judul bacaan, dan tombol settings.
- Global Majelis header tidak tampil di Reading Mode agar halaman terasa seperti digital kitab.
- Tidak ada Firebase/Admin implementation pada phase ini.

## Reading Layout

Reading content tetap memakai generic renderer berbasis data.

Urutan per block:
1. Arabic
2. Repeat indicator jika metadata `repeat` tersedia
3. Latin jika preference enabled
4. Arti jika preference enabled
5. Note jika ada

Reading blocks dibuat flat, tanpa card dashboard. Separation memakai whitespace, typography, dan divider tipis.

Arabic tetap:
- `dir="rtl"`
- `lang="ar"`
- Noto Naskh Arabic
- large default size
- comfortable line-height
- no text justification
- safe wrapping for long Arabic text

Repeat memakai integer metadata dan dapat menampilkan `×1`, `×3`, `×6`, `×7`, atau integer positif lain.

## Settings Behavior

Tombol gear membuka bottom sheet.

Bottom sheet berisi:
- Latin ON/OFF
- Arti ON/OFF
- ukuran teks Arab
- ukuran teks Latin
- ukuran teks Arti

Bottom sheet dapat ditutup lewat close button atau backdrop. Swipe gesture belum dibuat karena bukan requirement V1.

## Font Size Defaults And Ranges

Preference ukuran teks disimpan di localStorage bersama preference Latin/Arti.

Defaults:
- Arab: `32px`
- Latin: `16px`
- Arti: `16px`

Ranges:
- Arab: `26px` sampai `44px`, step `2`
- Latin: `14px` sampai `22px`, step `1`
- Arti: `14px` sampai `22px`, step `1`

Arabic range sengaja lebih besar karena Arabic adalah fokus utama Reading Mode.

## Responsive Notes

Target layout:
- phone narrow sekitar 360px
- phone normal sekitar 390px
- phone besar sekitar 430px
- desktop browser

Responsive handling:
- title di header truncates dengan ellipsis agar tombol back/settings tetap stabil
- reading surface memakai padding horizontal aman
- bottom sheet max-height agar tidak menutup seluruh layar jika tidak perlu
- Latin/Arti wrapping mengikuti lebar viewport
- Arabic public presentation memakai normal responsive wrapping. Source newline dari PDF/admin input dicollapse di presentation layer agar tidak memaksa line break visual.

## Tests

Updated tests cover:
- Arabic renders with RTL semantics
- repeat integer display including `×1`
- Latin hidden by default and toggled independently
- Arti hidden by default and toggled independently
- settings bottom sheet open/close
- font size control defaults/ranges
- preference persistence including font sizes
- PWA update behavior remains explicit
- content validation/fixture isolation remains intact

Verification commands:
- `npm.cmd run typecheck`
- `npm.cmd test`
- `npm.cmd run build`

## Limitations

- No Firebase/Admin implementation in this phase.
- No rich text editor.
- No swipe-to-dismiss gesture for settings.
- No automated visual screenshot QA was added; manual QA can use the dev server and existing development fixture.
