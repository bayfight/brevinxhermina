# PO-Resi-Invoice Dashboard

A Next.js web application for managing Purchase Orders, Shipping Receipts (Resi), and Invoices with role-based access control.

## Features

- **Role-Based Access Control**: 5 user roles with specific permissions
- **Purchase Order Management**: Upload and track POs
- **Resi Management**: Track shipments with sender/receiver information
- **Invoice Management**: Generate invoices with multiple attachments
- **Finance Tracking**: Monitor payment status by category
- **Firebase Backend**: Authentication, Firestore, and Storage

## Tech Stack

- **Frontend**: Next.js 14+ (App Router), React 18+, TypeScript
- **Backend**: Firebase (Authentication, Firestore, Storage, Admin SDK)
- **Styling**: Tailwind CSS
- **State Management**: React Server Components + Server Actions

## Getting Started

### Prerequisites

- Node.js 18+ and yarn
- Firebase project (already created at: https://console.firebase.google.com/u/0/project/brevin-kokarmina)

### Installation

1. Install dependencies:
```bash
yarn install
```

2. Set up environment variables:
   - Copy `.env.local.example` to `.env.local`
   - Fill in your Firebase credentials (see instructions below)

### Firebase Configuration

#### Step 1: Get Firebase Client SDK Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/u/0/project/brevin-kokarmina/settings/general)
2. Scroll to "Your apps" section
3. If you don't have a web app, click "Add app" and select Web (</>) icon
4. Copy the configuration values and paste them into `.env.local`:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`

#### Step 2: Get Firebase Admin SDK Credentials

1. Go to [Service Accounts](https://console.firebase.google.com/u/0/project/brevin-kokarmina/settings/serviceaccounts/adminsdk)
2. Click "Generate new private key"
3. Download the JSON file
4. Open the JSON file and copy these values to `.env.local`:
   - `FIREBASE_ADMIN_PROJECT_ID` (from `project_id`)
   - `FIREBASE_ADMIN_CLIENT_EMAIL` (from `client_email`)
   - `FIREBASE_ADMIN_PRIVATE_KEY` (from `private_key` - keep the quotes and newlines)

#### Step 3: Enable Firebase Services

1. **Enable Authentication**:
   - Go to [Authentication](https://console.firebase.google.com/u/0/project/brevin-kokarmina/authentication)
   - Click "Get started"
   - Enable "Email/Password" sign-in method

2. **Enable Firestore**:
   - Go to [Firestore Database](https://console.firebase.google.com/u/0/project/brevin-kokarmina/firestore)
   - Click "Create database"
   - Choose "Start in production mode"
   - Select a location (e.g., asia-southeast2)

3. **Enable Storage**:
   - Go to [Storage](https://console.firebase.google.com/u/0/project/brevin-kokarmina/storage)
   - Click "Get started"
   - Choose "Start in production mode"

#### Step 4: Deploy Security Rules

1. Install Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Login to Firebase:
```bash
firebase login
```

3. Initialize Firebase in your project:
```bash
firebase init
```
   - Select "Firestore" and "Storage"
   - Use existing project: brevin-kokarmina
   - Use `firestore.rules` for Firestore rules
   - Use `firestore.indexes.json` for Firestore indexes
   - Use `storage.rules` for Storage rules

4. Deploy rules:
```bash
firebase deploy --only firestore:rules,firestore:indexes,storage:rules
```

### Running the Development Server

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/                      # Next.js App Router
│   ├── (auth)/              # Authentication routes
│   ├── (dashboard)/         # Protected dashboard routes
│   ├── api/                 # API routes
│   └── actions/             # Server Actions
├── components/              # React components
├── lib/                     # Utility functions
│   ├── firebase-client.ts   # Firebase client SDK
│   └── firebase-admin.ts    # Firebase Admin SDK
├── types/                   # TypeScript type definitions
├── firestore.rules          # Firestore security rules
├── storage.rules            # Storage security rules
└── firestore.indexes.json   # Firestore indexes
```

## User Roles

1. **Super Admin**: Full access to all features
2. **Hermina Account**: Full PO access, read-only Resi and Invoice
3. **Staff Account**: Full Resi access, read-only PO
4. **Kopi Merchant Account**: Full Resi access, read-only PO and Finance (kopi, aren)
5. **Syrup Merchant Account**: Full Resi access, read-only PO and Finance (syrup)

## Next Steps

After completing the setup:

1. Create test users in Firebase Authentication
2. Set custom claims for user roles (use Firebase Admin SDK)
3. Test the authentication flow
4. Implement the remaining features according to the tasks.md file

## License

Private project for Brevin Kokarmina
