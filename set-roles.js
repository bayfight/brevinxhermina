const admin = require('firebase-admin');

// Muat service account key dari file eksternal yang di-ignore oleh git
const serviceAccount = require('./firebase-service-account.json');


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Daftar email user dan role-nya
// GANTI EMAIL INI dengan email yang sudah Anda buat di Firebase Console
const users = [
  { email: 'bayu@mailinator.com', role: 'super_admin' },           // Ganti dengan email Super Admin Anda
  { email: 'hermina@mailinator.com', role: 'hermina_account' },     // Ganti dengan email Hermina Anda
  { email: 'bpk@mailinator.com', role: 'staff_account' },         // Ganti dengan email Staff Anda
  { email: 'uharu@mailinator.com', role: 'kopi_merchant_account' },  // Ganti dengan email Kopi Merchant Anda
  { email: 'semeru@mailinator.com', role: 'syrup_merchant_account' } // Ganti dengan email Syrup Merchant Anda
];

async function setUserRole(email, role) {
  try {
    const user = await admin.auth().getUserByEmail(email);
    await admin.auth().setCustomUserClaims(user.uid, { role });
    console.log(`✅ Set role "${role}" untuk ${email}`);
  } catch (error) {
    console.error(`❌ Error untuk ${email}:`, error.message);
  }
}

async function main() {
  console.log('🚀 Setting user roles di Firebase...\n');
  
  for (const user of users) {
    await setUserRole(user.email, user.role);
  }
  
  console.log('\n✅ Selesai!');
  console.log('\n📝 Catatan:');
  console.log('   - User harus logout dan login ulang agar role berubah');
  console.log('   - Cek role dengan: firebase auth:export');
}

main();
