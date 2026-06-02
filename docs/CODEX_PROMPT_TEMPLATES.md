# Codex Prompt Templates

Gunakan template ini saat meminta Codex menambah fitur, improvement, bug fix, atau refactor di project ini. Isi bagian yang relevan, hapus bagian yang tidak perlu.

## 1. Add Feature

```text
Tolong tambahkan fitur berikut di project ini.

Fitur:
- [jelaskan fitur secara spesifik]

Tujuan user:
- [siapa yang pakai fitur ini dan untuk apa]

Scope:
- Ubah hanya area terkait: [contoh: PO form, invoice list, auth guard]
- Ikuti struktur existing project.
- Jangan deploy Firebase.
- Jangan ubah `.env.local` atau secrets.

Detail behavior:
- [aturan input/output]
- [validasi]
- [role access, jika ada]
- [state loading/error/success]

UI/UX:
- Ikuti style Tailwind dan komponen yang sudah ada.
- Jangan membuat landing page.
- Pastikan responsive.

Data/Firebase:
- Collection terkait: [nama collection]
- Field baru: [nama field dan tipe]
- Rules/indexes yang mungkin perlu dicek: [jika ada]

Dokumentasi:
- Update dokumentasi terkait jika behavior berubah.
- Jika mengubah schema, update `FIRESTORE_COLLECTIONS.md`.
- Jika mengubah upload file, update `FILE_UPLOAD_IMPLEMENTATION.md`.

Verification:
- Jalankan verifikasi yang relevan.
- Untuk perubahan besar, jalankan `npm run build`.
- Laporkan jika ada test/command yang gagal.
```

## 2. Improvement

```text
Tolong improve bagian berikut tanpa mengubah behavior utama.

Area:
- [contoh: dashboard metrics, upload flow, table search, role guard]

Masalah saat ini:
- [jelaskan pain point]

Target improvement:
- [hasil yang diharapkan]

Batasan:
- Jangan refactor besar di luar area ini.
- Jangan mengubah schema Firebase kecuali benar-benar perlu.
- Jangan deploy Firebase.
- Jangan sentuh `.env.local`.

Ekspektasi:
- Pertahankan compatibility dengan role access yang ada.
- Pertahankan existing route dan public API component kecuali ada alasan kuat.
- Update dokumentasi jika behavior berubah.

Verification:
- Cek TypeScript/build jika perubahan menyentuh kode app.
- Jelaskan file yang berubah dan alasan perubahan.
```

## 3. Refactor

```text
Tolong refactor area berikut agar lebih rapi dan maintainable.

Area refactor:
- [file/folder/fungsi]

Tujuan refactor:
- [contoh: mengurangi duplikasi, memisahkan logic, memperjelas tipe, membuat reusable helper]

Behavior:
- Behavior harus tetap sama.
- Jangan ubah UI/UX kecuali diperlukan untuk memperbaiki bug.
- Jangan ubah schema Firebase.
- Jangan deploy Firebase.

Batasan:
- Refactor hanya file terkait.
- Jangan rewrite seluruh module jika perubahan kecil cukup.
- Ikuti pattern existing project.

Verification:
- Bandingkan behavior sebelum/sesudah secara singkat.
- Jalankan `npm run build` jika refactor menyentuh banyak file.
- Laporkan risiko residual jika ada.
```

## 4. Bug Fix

```text
Tolong cari dan perbaiki bug berikut.

Bug:
- [jelaskan bug]

Expected behavior:
- [seharusnya bagaimana]

Actual behavior:
- [yang terjadi sekarang]

Steps to reproduce:
1. [step]
2. [step]
3. [step]

Scope:
- Cari root cause dulu sebelum edit.
- Ubah area paling kecil yang menyelesaikan bug.
- Jangan deploy Firebase.
- Jangan sentuh secrets atau `.env.local`.

Verification:
- Jalankan command/test yang relevan.
- Jelaskan root cause dan fix-nya.
```

## 5. Firebase Task

```text
Tolong bantu task Firebase berikut dengan mengikuti `docs/codex/FIREBASE_EXECUTION_CONTEXT.md`.

Task:
- [contoh: cek rules, siapkan deploy indexes, debug upload Storage, cek custom claims]

Batasan:
- Jangan deploy tanpa approval eksplisit dari saya.
- Jangan print secrets, `.env.local`, private key, atau service account JSON.
- Jangan switch Firebase project tanpa konfirmasi.

Target Firebase:
- Project ID: `brevin-kokarmina`
- File rules/indexes terkait: [firestore.rules/storage.rules/firestore.indexes.json]

Output yang saya butuhkan:
- Ringkasan temuan
- Perubahan file jika ada
- Command yang perlu approval jika harus dijalankan
```

## 6. Code Review

```text
Tolong review perubahan di area berikut.

Area:
- [file/folder/fitur]

Fokus review:
- Bug atau regression
- Security/auth/role access
- Firebase rules/schema mismatch
- Missing validation
- Missing loading/error state
- Risiko build/runtime

Format jawaban:
- Findings dulu, urut dari paling penting.
- Sertakan file dan line jika memungkinkan.
- Jangan refactor langsung kecuali saya minta.
```

## Prompt Pendek Harian

### Tambah fitur kecil

```text
Tolong tambahkan [fitur] di [area]. Ikuti pattern existing, jangan deploy Firebase, jangan sentuh `.env.local`, dan update dokumentasi kalau behavior berubah.
```

### Refactor kecil

```text
Tolong refactor [file/fungsi] supaya lebih rapi tanpa mengubah behavior. Scope tetap kecil dan jalankan verifikasi yang relevan.
```

### Debug

```text
Tolong debug masalah [masalah]. Cari root cause dulu, lalu perbaiki dengan perubahan paling kecil. Jangan deploy atau ubah secrets.
```

### Firebase

```text
Tolong bantu [task Firebase] dengan mengikuti `docs/codex/FIREBASE_EXECUTION_CONTEXT.md`. Jangan deploy tanpa approval eksplisit.
```

## Checklist Prompt Yang Baik

- Sebutkan area/file yang ingin diubah.
- Jelaskan expected behavior.
- Jelaskan batasan yang tidak boleh disentuh.
- Sebutkan apakah Firebase boleh disentuh atau tidak.
- Sebutkan apakah dokumentasi harus diupdate.
- Minta verifikasi yang sesuai dengan besarnya perubahan.
