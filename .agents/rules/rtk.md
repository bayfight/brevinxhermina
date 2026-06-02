# RTK (Rust Token Killer) Setup & Guidelines

RTK adalah proxy CLI yang dirancang untuk mengurangi konsumsi token AI dengan memotong dan mengompresi output perintah terminal (seperti build logs, git diff, linting, dll.) sebelum dikirim ke agen AI.

## Cara Kerja & Keuntungan
* **Kompresi Output:** Menyaring boilerplate, spasi kosong, komentar, dan log berulang.
* **Hemat Token:** Mengurangi penggunaan token hingga 60-90% pada perintah terminal yang menghasilkan banyak teks.
* **Konteks Stabil:** Mencegah context window agen penuh dengan cepat akibat output log yang panjang.

---

## 🛠️ Panduan Instalasi (Untuk User)
Jalankan salah satu metode berikut di terminal Anda untuk menginstal RTK:

1. **Menggunakan Homebrew (macOS):**
   ```bash
   brew install rtk
   ```

2. **Menggunakan Script Quick Install (macOS/Linux):**
   ```bash
   curl -fsSL https://raw.githubusercontent.com/rtk-ai/rtk/refs/heads/master/install.sh | sh
   ```

3. **Menggunakan Cargo (jika ada Rust):**
   ```bash
   cargo install --git https://github.com/rtk-ai/rtk
   ```

Setelah terinstal, jalankan perintah berikut untuk mengaktifkan hook global pada agen AI Anda:
```bash
rtk init -g
```
*Catatan: Setelah inisialisasi, **restart terminal atau aplikasi editor Anda** agar hook aktif sepenuhnya.*

---

## 🤖 Aturan Eksekusi Agen (Untuk Antigravity)
* **Gunakan prefix `rtk`** secara eksplisit untuk perintah terminal yang berpotensi menghasilkan output panjang:
  * ✅ `rtk yarn build` (bukan `yarn build`)
  * ✅ `rtk yarn lint` (bukan `yarn lint`)
  * ✅ `rtk git diff` (bukan `git diff`)
  * ✅ `rtk git status` (bukan `git status`)
  * ✅ `rtk git log -n 5` (bukan `git log`)
* **Deteksi Ketersediaan:** Jika perintah `rtk` tidak ditemukan di sistem, jalankan perintah tanpa prefix `rtk` dan ingatkan user secara sopan di akhir turn untuk menjalankan skrip instalasi `rtk-setup.sh`.
* **Statistik Penghematan:** Anda dapat menjalankan `rtk gain` untuk melihat seberapa banyak token yang berhasil dihemat.
