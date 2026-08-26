# UI / UX SPECIFICATION — Public Home, Reading Mode, Admin Editor

## 1. UI Contexts

Aplikasi memiliki tiga konteks UI yang berbeda dan tidak boleh dicampur:

1. **Public Home / Navigation**
2. **Public Reading Mode**
3. **Admin Content Editor**

Referensi visual terbaru menjadi inspirasi utama untuk **Reading Mode**, bukan untuk merombak Home menjadi halaman kitab tunggal.

---

## 2. Public Home — Keep Current Concept

Home tetap mempertahankan konsep aplikasi sekarang:

- identitas/logo Majelis Wasilatul Muhtadin
- menu/kategori utama:
  - Ratib
  - Tawasul
  - Tahlil
  - Doa-doa
- kategori dapat membuka daftar bacaan jika memiliki lebih dari satu bacaan
- clean, warm, mobile-first
- public tidak perlu login

Home boleh dipoles ringan untuk konsistensi, tetapi task Reading UI tidak boleh melakukan redesign besar Home.

Contoh flow:

```text
Home
→ Ratib
→ Ratib Al-Haddad
→ Reading Mode
```

---

## 3. Reading Mode — Primary Visual Direction

Saat user membuka bacaan seperti **Ratib Al-Haddad**, UI berubah menjadi pengalaman membaca yang sangat minimal dan bersih.

Karakter utama:

- terasa seperti digital kitab
- background terang/netral
- hampir tanpa card
- whitespace lega
- fokus visual utama pada Arabic
- controls minimal
- tidak terasa seperti dashboard

Gunakan referensi visual user sebagai arah komposisi dan density, tetapi jangan menyalin branding atau elemen yang tidak dibutuhkan.

---

## 4. Reading Header

Header minimal:

```text
←   Ratib Al-Haddad                         ⚙
```

Requirement:

- back button
- nama bacaan
- settings button
- compact
- boleh sticky jika tidak mengganggu pembacaan

Jangan tambahkan tanpa requirement eksplisit:

- tanggal Hijriah
- download button
- ads
- social action
- menu kompleks

---

## 5. Reading Content Layout

Setiap content block dirender linear dari atas ke bawah.

Urutan:

1. Arabic
2. Repeat indicator jika ada
3. Latin jika enabled
4. Arti jika enabled
5. Note jika ada

Gunakan spacing dan typography sebagai separator utama.

Hindari card border/shadow per block kecuali sangat subtle dan memang diperlukan.

---

## 6. Arabic Typography

Arabic adalah prioritas visual tertinggi.

Requirement:

- `dir="rtl"`
- `lang="ar"`
- Noto Naskh Arabic sebagai current starting font
- ukuran besar
- line-height lapang
- harakat tidak terpotong
- tidak justify
- horizontal padding cukup
- nyaman untuk Android dan iPhone
- default size harus layak dipakai saat pengajian

---

## 7. Latin dan Arti

Latin dan Arti:

- hidden by default untuk user baru
- toggle independen
- tampil langsung di bawah Arabic block terkait
- tidak dipindah ke halaman lain
- preference disimpan lokal

Hierarchy:

- Arabic paling dominan
- Latin lebih kecil
- Arti lebih subtle dari Latin

---

## 8. Repeat Indicator

Repeat count berasal dari metadata block admin.

Contoh:

- `×1`
- `×3`
- `×6`
- `×7`
- angka lain sesuai input admin

Repeat tidak ditanam ke dalam Arabic/Latin string.

Reading page hanya **menampilkan** repeat metadata. Tidak ada counter interaktif V1 kecuali diminta terpisah nanti.

---

## 9. Reading Settings — Bottom Sheet

Settings dibuka melalui icon gear dan tampil sebagai bottom sheet pada mobile.

Minimal controls:

### Tampilan
- Latin: ON/OFF
- Arti: ON/OFF

### Ukuran teks
- Arab
- Latin
- Arti

Gunakan slider atau compact step control yang nyaman pada touch device.

Preference disimpan local dan digunakan pada reading berikutnya.

Bottom sheet harus mudah ditutup dengan:
- close/back control
- backdrop/tap outside bila implementasinya aman
- swipe-to-dismiss optional, bukan requirement

---

## 10. Font Size Preferences

Font size bersifat presentation preference, bukan content.

Simpan lokal.

Harus memiliki:
- sensible minimum
- sensible maximum
- default
- tidak membuat layout rusak

Arabic range harus lebih besar dibanding default Latin/Arti.

---

## 11. Public Home vs Reading Mode

Jangan membuat seluruh aplikasi menyerupai screenshot referensi.

Yang diadopsi dari referensi terutama:

- reading density
- whitespace
- Arabic prominence
- minimal header
- settings bottom sheet
- adjustable reading size

Home tetap navigation-oriented dan memiliki identitas Majelis.

---

## 12. Admin UI Boundary

Admin Editor adalah area terpisah.

Admin UI boleh form-oriented dan lebih optimal di desktop/tablet.

Jangan membawa admin controls ke public Home atau Reading Mode.

---

## 13. Admin Block Editing Model

Admin mengelola content **per block**.

Setiap block merupakan satu unit pasangan:

- Arabic
- Latin
- Arti
- Repeat
- Note optional

Contoh:

```text
Block 1
Arabic: ...
Latin: ...
Arti: ...
Repeat: 1x

Block 2
Arabic: ...
Latin: ...
Arti: ...
Repeat: 3x
```

Admin kemudian dapat menambahkan block berikutnya.

Jangan membuat satu textarea besar untuk seluruh Ratib/Tahlil jika data sebenarnya terdiri dari beberapa block.

---

## 14. Accessibility / Mobile

- touch target cukup besar
- semantic buttons
- visible focus
- settings dapat dipakai dengan satu tangan
- Arabic tidak terpotong saat font diperbesar
- Latin/Arti tidak menyebabkan overflow horizontal
- orientation change tidak merusak state

---

## 15. Dark Mode

Deferred.

Jangan implement pada task Reading UI Polish ini.
