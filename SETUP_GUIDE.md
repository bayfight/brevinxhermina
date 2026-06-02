# Firebase Setup Guide

This guide will walk you through setting up Firebase for the PO-Resi-Invoice Dashboard.

## Prerequisites

You already have a Firebase project at: https://console.firebase.google.com/u/0/project/brevin-kokarmina

## Step-by-Step Setup

### 1. Get Firebase Web App Credentials

1. Open your Firebase Console: https://console.firebase.google.com/u/0/project/brevin-kokarmina/settings/general
2. Scroll down to "Your apps" section
3. If you see a web app (</> icon), click on it to view the config
4. If you don't have a web app yet:
   - Click "Add app" button
   - Select the Web platform (</> icon)
   - Give it a nickname (e.g., "PO-Resi-Invoice Dashboard")
   - Click "Register app"
5. Copy the Firebase configuration object that looks like this:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "brevin-kokarmina.firebaseapp.com",
  projectId: "brevin-kokarmina",
  storageBucket: "brevin-kokarmina.firebasestorage.app",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

6. Create a `.env.local` file in the project root (copy from `.env.local.example`)
7. Fill in these values:
   - `NEXT_PUBLIC_FIREBASE_API_KEY` = apiKey
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` = authDomain
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID` = projectId
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` = storageBucket
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` = messagingSenderId
   - `NEXT_PUBLIC_FIREBASE_APP_ID` = appId

### 2. Get Firebase Admin SDK Credentials

1. Go to: https://console.firebase.google.com/u/0/project/brevin-kokarmina/settings/serviceaccounts/adminsdk
2. Click the "Generate new private key" button
3. Click "Generate key" in the confirmation dialog
4. A JSON file will be downloaded to your computer
5. Open the downloaded JSON file in a text editor
6. Copy these values to your `.env.local` file:
   - `FIREBASE_ADMIN_PROJECT_ID` = the value of `project_id`
   - `FIREBASE_ADMIN_CLIENT_EMAIL` = the value of `client_email`
   - `FIREBASE_ADMIN_PRIVATE_KEY` = the value of `private_key` (keep the quotes and \n characters)

**Important**: The private key should look like this in your `.env.local`:
```
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBg...\n-----END PRIVATE KEY-----\n"
```

### 3. Enable Firebase Authentication

1. Go to: https://console.firebase.google.com/u/0/project/brevin-kokarmina/authentication
2. Click "Get started" (if you haven't enabled Authentication yet)
3. Click on the "Sign-in method" tab
4. Click on "Email/Password"
5. Enable the "Email/Password" toggle
6. Click "Save"

### 4. Enable Cloud Firestore

1. Go to: https://console.firebase.google.com/u/0/project/brevin-kokarmina/firestore
2. Click "Create database"
3. Select "Start in production mode" (we'll deploy custom rules later)
4. Choose a location (recommended: `asia-southeast2` for Indonesia)
5. Click "Enable"

### 5. Enable Firebase Storage

1. Go to: https://console.firebase.google.com/u/0/project/brevin-kokarmina/storage
2. Click "Get started"
3. Click "Next" to use production mode
4. Choose the same location as Firestore
5. Click "Done"

### 6. Deploy Security Rules

1. Install Firebase CLI globally (if not already installed):
```bash
npm install -g firebase-tools
```

2. Login to Firebase:
```bash
firebase login
```

3. Initialize Firebase in your project directory:
```bash
firebase init
```

When prompted:
- Select "Firestore" and "Storage" (use spacebar to select, enter to confirm)
- Choose "Use an existing project"
- Select "brevin-kokarmina"
- For Firestore rules file: press Enter to use `firestore.rules`
- For Firestore indexes file: press Enter to use `firestore.indexes.json`
- For Storage rules file: press Enter to use `storage.rules`

4. Deploy the security rules:
```bash
firebase deploy --only firestore:rules,firestore:indexes,storage:rules
```

### 7. Create Test Users

1. Go to: https://console.firebase.google.com/u/0/project/brevin-kokarmina/authentication/users
2. Click "Add user"
3. Enter an email and password
4. Click "Add user"
5. Repeat for each role you want to test

### 8. Set User Roles (Custom Claims)

User roles are stored as custom claims in Firebase Authentication. You'll need to set these using the Firebase Admin SDK.

Create a script or use the Firebase Admin SDK to set custom claims:

```javascript
// Example: Set user role to super_admin
admin.auth().setCustomUserClaims(uid, { role: 'super_admin' });
```

Available roles:
- `super_admin`
- `hermina_account`
- `staff_account`
- `kopi_merchant_account`
- `syrup_merchant_account`

**Note**: Setting custom claims will be easier once the admin interface is built in later tasks.

### 9. Verify Setup

1. Make sure your `.env.local` file has all the required values
2. Run the development server:
```bash
npm run dev
```

3. Open http://localhost:3000 in your browser
4. You should see the login page

### 10. Next Steps

- Task 2 will implement the authentication flow
- Task 3 will set up the data models
- Task 4 will implement authorization

## Troubleshooting

### Error: "Missing Firebase Admin SDK credentials"
- Make sure all three environment variables are set in `.env.local`:
  - `FIREBASE_ADMIN_PROJECT_ID`
  - `FIREBASE_ADMIN_CLIENT_EMAIL`
  - `FIREBASE_ADMIN_PRIVATE_KEY`
- Make sure the private key includes the `\n` characters

### Error: "Firebase: Error (auth/invalid-api-key)"
- Check that `NEXT_PUBLIC_FIREBASE_API_KEY` is correct
- Make sure you copied it from the Firebase Console

### Error: "Firebase: Error (auth/project-not-found)"
- Check that `NEXT_PUBLIC_FIREBASE_PROJECT_ID` is set to `brevin-kokarmina`

### Security Rules Not Working
- Make sure you deployed the rules: `firebase deploy --only firestore:rules,storage:rules`
- Check the Firebase Console to verify the rules are deployed

## Security Notes

- **Never commit `.env.local` to version control** - it contains sensitive credentials
- The `.env.local.example` file is safe to commit as it only contains placeholders
- Keep your Firebase Admin SDK private key secure
- Only share credentials through secure channels

## Support

If you encounter any issues during setup, please check:
1. Firebase Console for any error messages
2. Browser console for client-side errors
3. Terminal/server logs for server-side errors
