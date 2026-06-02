# Firestore Deployment Guide

This guide explains how to deploy Firestore indexes, security rules, and Storage security rules for the PO-Resi-Invoice Dashboard.

## Prerequisites

1. **Firebase CLI Installation**

   Install Firebase CLI globally:
   ```bash
   npm install -g firebase-tools
   ```

2. **Firebase Login**

   Login to your Firebase account:
   ```bash
   firebase login
   ```

3. **Firebase Project Initialization**

   If not already initialized, initialize Firebase in your project:
   ```bash
   firebase init
   ```
   
   Select:
   - Firestore (Database Rules and Indexes)
   - Storage (Storage Rules)
   
   Choose your Firebase project when prompted.

## Deployment Steps

### 1. Deploy Firestore Indexes

Deploy the composite indexes defined in `firestore.indexes.json`:

```bash
firebase deploy --only firestore:indexes
```

**What this deploys**:
- Composite index for `purchase_orders`: `category` + `createdAt`
- Composite indexes for `resis`: `category` + `status`, `status` + `createdAt`
- Composite index for `invoices`: `category` + `createdAt`
- Composite indexes for `finance_records`: `category` + `paymentStatus`, `paymentStatus` + `createdAt`
- Composite index for `master_data_locations`: `province` + `name`

**Note**: Index creation can take several minutes. You can monitor progress in the Firebase Console under Firestore → Indexes.

### 2. Deploy Firestore Security Rules

Deploy the security rules defined in `firestore.rules`:

```bash
firebase deploy --only firestore:rules
```

**What this deploys**:
- Role-based access control for all collections
- Category-based filtering for merchant accounts
- Authentication requirements for all operations
- Helper functions for permission checks

### 3. Deploy Storage Security Rules

Deploy the storage security rules defined in `storage.rules`:

```bash
firebase deploy --only storage
```

**What this deploys**:
- File upload/download permissions by role
- Path-based access control for PO, Resi, and Invoice files
- Authentication requirements for all file operations

### 4. Deploy All at Once

To deploy indexes and rules together:

```bash
firebase deploy --only firestore,storage
```

## Verification

### Verify Indexes

1. Open Firebase Console: https://console.firebase.google.com
2. Navigate to your project
3. Go to Firestore Database → Indexes
4. Verify all composite indexes are listed and status is "Enabled"

Expected indexes:
- `purchase_orders`: 1 composite index
- `resis`: 2 composite indexes
- `invoices`: 1 composite index
- `finance_records`: 2 composite indexes
- `master_data_locations`: 1 composite index

### Verify Firestore Rules

1. In Firebase Console, go to Firestore Database → Rules
2. Verify the rules match the content of `firestore.rules`
3. Check the "Published" timestamp to confirm latest deployment

### Verify Storage Rules

1. In Firebase Console, go to Storage → Rules
2. Verify the rules match the content of `storage.rules`
3. Check the "Published" timestamp to confirm latest deployment

## Testing Rules Locally

### Using Firebase Emulator Suite

1. **Install Emulator Suite** (if not already installed):
   ```bash
   firebase init emulators
   ```
   
   Select:
   - Firestore Emulator
   - Storage Emulator

2. **Start Emulators**:
   ```bash
   firebase emulators:start
   ```

3. **Run Tests Against Emulators**:
   Your application will automatically connect to emulators when they're running.
   
   Emulator UI: http://localhost:4000

### Testing Security Rules

Create test files in `__tests__/security/` to test rules:

```typescript
// Example: __tests__/security/firestore.rules.test.ts
import { initializeTestEnvironment } from '@firebase/rules-unit-testing';

describe('Firestore Security Rules', () => {
  let testEnv;

  beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: 'test-project',
      firestore: {
        rules: fs.readFileSync('firestore.rules', 'utf8'),
      },
    });
  });

  afterAll(async () => {
    await testEnv.cleanup();
  });

  test('Super Admin can read all POs', async () => {
    const context = testEnv.authenticatedContext('user1', {
      role: 'super_admin',
    });
    const db = context.firestore();
    
    await assertSucceeds(
      db.collection('purchase_orders').doc('po1').get()
    );
  });

  test('Staff Account cannot write POs', async () => {
    const context = testEnv.authenticatedContext('user2', {
      role: 'staff_account',
    });
    const db = context.firestore();
    
    await assertFails(
      db.collection('purchase_orders').doc('po1').set({
        poNumber: 'PO-001',
        category: 'kopi',
      })
    );
  });
});
```

## Troubleshooting

### Index Creation Fails

**Problem**: Index deployment fails with "Index already exists" error.

**Solution**: 
1. Check Firebase Console → Firestore → Indexes
2. Delete conflicting indexes manually
3. Re-deploy: `firebase deploy --only firestore:indexes`

### Rules Deployment Fails

**Problem**: Rules deployment fails with syntax error.

**Solution**:
1. Validate rules syntax locally:
   ```bash
   firebase firestore:rules:validate
   ```
2. Fix any syntax errors in `firestore.rules` or `storage.rules`
3. Re-deploy

### Permission Denied Errors

**Problem**: Users getting "Permission denied" errors in production.

**Solution**:
1. Verify user has correct role in custom claims:
   ```typescript
   // Check user's custom claims
   const user = await admin.auth().getUser(uid);
   console.log(user.customClaims);
   ```
2. Verify rules are deployed:
   - Check Firebase Console → Firestore → Rules
   - Verify "Published" timestamp is recent
3. Test rules in Emulator Suite to isolate issue

### Index Not Found Errors

**Problem**: Queries fail with "Index not found" error.

**Solution**:
1. Check if index is enabled in Firebase Console
2. Wait for index creation to complete (can take 5-10 minutes)
3. If index is missing, deploy again:
   ```bash
   firebase deploy --only firestore:indexes
   ```

## Production Deployment Checklist

Before deploying to production:

- [ ] Test all rules in Firebase Emulator Suite
- [ ] Verify all indexes are defined in `firestore.indexes.json`
- [ ] Review security rules for any overly permissive access
- [ ] Test with all user roles (super_admin, hermina_account, staff_account, merchant accounts)
- [ ] Verify category filtering works correctly for merchant accounts
- [ ] Test file upload/download with Storage rules
- [ ] Backup existing rules before deploying (Firebase Console → Rules → View History)
- [ ] Deploy during low-traffic period
- [ ] Monitor Firebase Console for errors after deployment
- [ ] Test critical workflows after deployment

## Continuous Deployment

### GitHub Actions Example

Add to `.github/workflows/firebase-deploy.yml`:

```yaml
name: Deploy to Firebase

on:
  push:
    branches:
      - main
    paths:
      - 'firestore.rules'
      - 'firestore.indexes.json'
      - 'storage.rules'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Install Firebase CLI
        run: npm install -g firebase-tools
      
      - name: Deploy Firestore Rules and Indexes
        run: firebase deploy --only firestore,storage --token ${{ secrets.FIREBASE_TOKEN }}
        env:
          FIREBASE_TOKEN: ${{ secrets.FIREBASE_TOKEN }}
```

To generate a CI token:
```bash
firebase login:ci
```

Store the token in GitHub Secrets as `FIREBASE_TOKEN`.

## Additional Resources

- [Firestore Security Rules Documentation](https://firebase.google.com/docs/firestore/security/get-started)
- [Firestore Indexes Documentation](https://firebase.google.com/docs/firestore/query-data/indexing)
- [Storage Security Rules Documentation](https://firebase.google.com/docs/storage/security)
- [Firebase Emulator Suite Documentation](https://firebase.google.com/docs/emulator-suite)
- [Rules Unit Testing Documentation](https://firebase.google.com/docs/rules/unit-tests)
