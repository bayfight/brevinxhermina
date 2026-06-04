const admin = require('firebase-admin');
const XLSX = require('xlsx');
const serviceAccount = require('./firebase-service-account.json');

// Inisialisasi Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const COLLECTION_NAME = 'master_data_locations';

async function seedLocations() {
  try {
    console.log('🚀 Membaca file Excel docs/PIC UNIT UPDATE.xlsx...');
    const workbook = XLSX.readFile('docs/PIC UNIT UPDATE.xlsx');
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rawData = XLSX.utils.sheet_to_json(sheet);

    if (rawData.length === 0) {
      console.error('❌ File Excel kosong atau tidak terbaca.');
      return;
    }

    // Header ada di rawData[0] (telah divalidasi sebelumnya):
    // __EMPTY: 'Cabang Hermina'
    // __EMPTY_1: 'Alamat'
    // __EMPTY_3: 'Nama PIC'
    // __EMPTY_4: 'No. HP'
    
    // Baris data dimulai dari index 1 karena rawData[0] adalah header
    const locationsToInsert = [];
    
    for (let i = 1; i < rawData.length; i++) {
      const row = rawData[i];
      const branchName = (row.__EMPTY || '').toString().trim();
      const address = (row.__EMPTY_1 || '').toString().trim();
      const picName = (row.__EMPTY_3 || '').toString().trim();
      
      // HP formatting
      let picPhone = (row.__EMPTY_4 || '').toString().trim();
      if (picPhone && !picPhone.startsWith('0') && !picPhone.startsWith('+') && !picPhone.startsWith('62')) {
        picPhone = '0' + picPhone;
      }

      if (!branchName) {
        continue; // Lewati baris kosong
      }

      locationsToInsert.push({
        branchName,
        address,
        picName,
        picPhone,
        status: 'active',
        createdBy: 'system',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    console.log(`📦 Ditemukan ${locationsToInsert.length} data lokasi Hermina valid.`);

    // 1. Bersihkan koleksi lama
    console.log('🧹 Membersihkan data lokasi lama di Firestore...');
    const snapshot = await db.collection(COLLECTION_NAME).get();
    const deleteBatch = db.batch();
    snapshot.docs.forEach(doc => {
      deleteBatch.delete(doc.ref);
    });
    await deleteBatch.commit();
    console.log('✅ Berhasil membersihkan data lokasi lama.');

    // 2. Tulis data baru (Batching 500 dokumen max per batch)
    console.log('📤 Mengunggah data lokasi baru ke Firestore...');
    const batchLimit = 400; // di bawah limit 500 agar aman
    for (let i = 0; i < locationsToInsert.length; i += batchLimit) {
      const batch = db.batch();
      const chunk = locationsToInsert.slice(i, i + batchLimit);
      
      chunk.forEach(location => {
        const docRef = db.collection(COLLECTION_NAME).doc();
        batch.set(docRef, location);
      });

      await batch.commit();
      console.log(`  Uploaded batch ${Math.floor(i / batchLimit) + 1}...`);
    }

    console.log('🎉 Seeding sukses! Seluruh data lokasi telah diperbarui.');
  } catch (error) {
    console.error('❌ Terjadi kesalahan saat seeding data:', error);
  }
}

seedLocations().then(() => process.exit(0));
