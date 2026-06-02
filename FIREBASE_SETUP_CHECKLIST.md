# Firebase Setup Checklist

Use this checklist to track your Firebase setup progress.

## ✅ Prerequisites
- [x] Firebase project exists: https://console.firebase.google.com/u/0/project/brevin-kokarmina
- [x] Next.js project initialized
- [x] Dependencies installed

## 📋 Setup Steps

### 1. Environment Variables
- [ ] Created `.env.local` file (copy from `.env.local.example`)
- [ ] Added Firebase Web App credentials:
  - [ ] `NEXT_PUBLIC_FIREBASE_API_KEY`
  - [ ] `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
  - [ ] `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
  - [ ] `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
  - [ ] `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
  - [ ] `NEXT_PUBLIC_FIREBASE_APP_ID`
- [ ] Added Firebase Admin SDK credentials:
  - [ ] `FIREBASE_ADMIN_PROJECT_ID`
  - [ ] `FIREBASE_ADMIN_CLIENT_EMAIL`
  - [ ] `FIREBASE_ADMIN_PRIVATE_KEY`

### 2. Firebase Console Setup
- [ ] Enabled Firebase Authentication
  - [ ] Enabled Email/Password sign-in method
- [ ] Created Firestore Database
  - [ ] Selected production mode
  - [ ] Chose location: `asia-southeast2` (or your preferred location)
- [ ] Enabled Firebase Storage
  - [ ] Used same location as Firestore

### 3. Firebase CLI Setup
- [ ] Installed Firebase CLI: `npm install -g firebase-tools`
- [ ] Logged in: `firebase login`
- [ ] Initialized project: `firebase init`
  - [ ] Selected Firestore and Storage
  - [ ] Selected existing project: brevin-kokarmina
  - [ ] Confirmed firestore.rules file
  - [ ] Confirmed firestore.indexes.json file
  - [ ] Confirmed storage.rules file
- [ ] Deployed security rules: `firebase deploy --only firestore:rules,firestore:indexes,storage:rules`

### 4. Test Users (Optional for now)
- [ ] Created test user in Firebase Authentication
- [ ] Set custom claims for test user (will be easier after Task 2)

### 5. Verification
- [ ] Run development server: `npm run dev`
- [ ] Open http://localhost:3000
- [ ] See login page without errors
- [ ] Check browser console for any Firebase errors

## 🚀 Quick Start Commands

```bash
# Install dependencies (if not done)
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Deploy Firebase rules
firebase deploy --only firestore:rules,firestore:indexes,storage:rules
```

## 📚 Reference Documents

- **SETUP_GUIDE.md**: Detailed step-by-step Firebase setup instructions
- **README.md**: Project overview and general documentation
- **PROJECT_STRUCTURE.md**: Directory structure and file organization
- **.env.local.example**: Template for environment variables

## 🔗 Important Links

- Firebase Console: https://console.firebase.google.com/u/0/project/brevin-kokarmina
- Firebase Authentication: https://console.firebase.google.com/u/0/project/brevin-kokarmina/authentication
- Firestore Database: https://console.firebase.google.com/u/0/project/brevin-kokarmina/firestore
- Firebase Storage: https://console.firebase.google.com/u/0/project/brevin-kokarmina/storage
- Service Accounts: https://console.firebase.google.com/u/0/project/brevin-kokarmina/settings/serviceaccounts/adminsdk

## ❓ Troubleshooting

If you encounter issues:

1. **Check environment variables**: Make sure all variables in `.env.local` are set correctly
2. **Check Firebase Console**: Verify all services are enabled
3. **Check browser console**: Look for Firebase initialization errors
4. **Check terminal**: Look for server-side errors
5. **Refer to SETUP_GUIDE.md**: Detailed troubleshooting section

## ✨ Next Steps

Once Firebase setup is complete:
- [ ] Proceed to Task 2: Implement authentication infrastructure
- [ ] Create test users with different roles
- [ ] Test login functionality
- [ ] Implement remaining features per tasks.md

---

**Note**: Keep your `.env.local` file secure and never commit it to version control!
