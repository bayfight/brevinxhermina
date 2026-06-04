CHANGE REQUEST - REVISI ALUR PO, RESI, DAN INVOICE
General Rules
Jangan mengubah struktur RBAC yang sudah ada.
Jangan mengubah relasi data antara PO, Resi, Invoice, dan Finance kecuali yang disebutkan pada dokumen ini.
Seluruh perubahan harus backward compatible terhadap data yang sudah ada.
Validasi wajib dilakukan baik di frontend maupun backend.
1. PURCHASE ORDER (PO)
Objective

Menyederhanakan proses input Purchase Order dengan menjadikan file upload sebagai sumber data utama.

Create PO
Field yang dipertahankan:
PO Number
PO Date
Upload File PO
Field yang dihapus:
Client Name
Item List
Quantity
Amount
Seluruh field input manual lainnya selain yang disebutkan di atas
Lokasi Hermina

Tambahkan field:

Hermina Location

Ketentuan:

Tidak dapat diinput manual oleh user
Nilai dibaca dari file PO yang diupload
Bersifat read-only
Validation

Jika hasil parsing file tidak menemukan lokasi Hermina:

Tampilkan error:

"Lokasi Hermina tidak ditemukan pada file PO. Silakan upload file yang valid."

PO tidak boleh disimpan sebelum validasi berhasil.

Edit PO

Ketentuan sama dengan Create PO:

Field yang dapat diubah:

PO Number
PO Date
Upload File PO

Lokasi Hermina:

Auto generated dari file
Read Only
Wajib ditemukan pada file

Jika lokasi Hermina tidak ditemukan:

Tampilkan error
Simpan perubahan diblokir
2. RESI
Objective

Menyederhanakan data Resi dengan menghapus informasi yang tidak lagi digunakan.

Create Resi

Hapus field:

Category
Status
Edit Resi

Hapus field:

Category
Status
Detail Resi

Hapus informasi:

Category
Status
Resi Table

Remove columns:

Category
Status
Backend

Field berikut tidak lagi digunakan:

category
status

Jika masih ada pada database:

abaikan saat create/update
jangan tampilkan di UI
3. INVOICE
Objective

Menyederhanakan proses invoice dan memastikan keterkaitan dengan PO dan Resi lebih jelas.

Create Invoice
Hapus field:
Category
Document Upload Section
Upload Documents

Dokumen yang boleh diupload hanya:

Surat Jalan
Struk

Validasi:

Selain dua jenis dokumen tersebut harus ditolak
PO Reference

PO tidak lagi dipilih secara manual.

Sistem harus:

Menampilkan PO yang sudah terhubung
Auto populate berdasarkan data transaksi
Bersifat View Only

User tidak dapat mengubah PO dari halaman Invoice.

Resi Reference

Resi tidak lagi dipilih secara manual.

Sistem harus:

Menampilkan daftar Resi yang sudah terhubung
Auto populate berdasarkan transaksi
Bersifat View Only

User tidak dapat menambah atau menghapus Resi dari halaman Invoice.

Edit Invoice

Ketentuan yang sama berlaku:

Category tidak ada
PO hanya View Only
Resi hanya View Only
Upload hanya Struk dan Surat Jalan
Database Impact
Purchase Orders

Tambahkan field:

herminaLocation

Source:

hasil parsing file PO

Required:

Yes
Resi

Deprecated fields:

category
status
Invoice

Deprecated fields:

category

Dokumen yang diperbolehkan:

deliveryNote (Surat Jalan)
receipt (Struk)

PO dan Resi tetap tersimpan sebagai foreign key tetapi tidak dapat diedit dari UI Invoice.