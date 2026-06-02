# Firebase Execution Context

This document defines the expected AI/Codex workflow for commands that connect this app to Firebase.

## Scope

Use this context for commands related to:

- Firebase CLI login/project selection.
- Deploying Firestore rules, Storage rules, or Firestore indexes.
- Validating Firebase rules.
- Running Firebase emulators.
- Setting Firebase Auth custom claims with `set-roles.js`.
- Testing upload/download workflows against Firebase Storage.

## Project Facts

- Firebase project ID: `brevin-kokarmina`
- Firebase config file: `firebase.json`
- Firestore rules file: `firestore.rules`
- Firestore indexes file: `firestore.indexes.json`
- Storage rules file: `storage.rules`
- Role setup helper: `set-roles.js`

`firebase.json` maps deploy targets to the local files above.

## Approval Rules

Ask for explicit user approval before running commands that:

- Deploy anything to Firebase.
- Change Firebase project state.
- Set or modify Auth custom claims.
- Write to production Firestore or Storage.
- Read or use credential files outside the repo.

Never print secrets, private keys, service account JSON, or `.env.local` contents in chat.

## Preferred Command Flow

### 1. Inspect Local Configuration

Safe commands:

```bash
firebase --version
firebase use
firebase projects:list
```

If the Firebase CLI is not installed, ask before installing global tools.

### 2. Validate Files Before Deploy

Check that these files exist:

```bash
firebase.json
firestore.rules
firestore.indexes.json
storage.rules
```

Review changed rules/indexes before deploy. If available, validate Firestore rules:

```bash
firebase firestore:rules:validate
```

### 3. Deploy Only What Is Needed

Deploy Firestore rules only:

```bash
firebase deploy --only firestore:rules --project brevin-kokarmina
```

Deploy Firestore indexes only:

```bash
firebase deploy --only firestore:indexes --project brevin-kokarmina
```

Deploy Storage rules only:

```bash
firebase deploy --only storage --project brevin-kokarmina
```

Deploy all Firebase rules/indexes for this repo:

```bash
firebase deploy --only firestore:rules,firestore:indexes,storage:rules --project brevin-kokarmina
```

Run these deploy commands only after user approval.

## Emulator Workflow

Prefer emulators for rules testing when possible:

```bash
firebase emulators:start --only firestore,storage --project brevin-kokarmina
```

Use this for local testing before production deploy. Do not assume emulator data reflects production.

## Custom Claims Workflow

The repo has `set-roles.js` for Firebase Auth role claims.

Before running it:

- Confirm which user emails and roles should be changed.
- Confirm required Admin SDK environment variables or credentials are configured.
- Do not print private key values or service account file content.

Run only after approval:

```bash
node set-roles.js
```

After changing custom claims, users may need to log out and log in again to refresh ID token claims.

## File Upload Workflow

For upload issues, inspect:

- `lib/firebase-storage.ts`
- `components/common/FileUpload.tsx`
- `components/po/POForm.tsx`
- `components/resi/ResiForm.tsx`
- `components/invoice/InvoiceForm.tsx`
- `storage.rules`
- `FILE_UPLOAD_IMPLEMENTATION.md`

Before concluding that upload is broken, verify:

- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` is configured.
- Firebase Storage is enabled in Firebase Console.
- `storage.rules` are deployed.
- User is authenticated.
- User custom claim role matches the role expected by the rules.
- File type and file size match the component restrictions.

## Documentation Updates

Update documentation when behavior changes:

- Firestore schema or relationship changes: `FIRESTORE_COLLECTIONS.md`
- Firebase deploy steps: `FIRESTORE_DEPLOYMENT_GUIDE.md`
- Upload path/type/size/required-file changes: `FILE_UPLOAD_IMPLEMENTATION.md`
- Project structure changes: `PROJECT_STRUCTURE.md`

## Do Not Do

- Do not deploy to Firebase as a side effect of a documentation-only task.
- Do not switch Firebase projects without telling the user.
- Do not add service account JSON files to the repo.
- Do not commit `.env.local`, `.env`, private keys, tokens, or generated Firebase debug logs.
