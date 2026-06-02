# Project Structure

This document outlines the current directory structure for the PO-Resi-Invoice Dashboard.

## Current Structure

```text
dhasboard_brevin/
├── app/                              # Next.js App Router
│   ├── (auth)/
│   │   └── login/                    # Login page
│   ├── (dashboard)/                  # Protected dashboard routes
│   │   ├── dashboard/                # Dashboard summary
│   │   ├── finance/                  # Finance read-only page
│   │   ├── invoice/                  # Invoice list/create/edit pages
│   │   ├── master-data/              # Master Data Item list/create/edit pages
│   │   ├── master-data-lokasi/       # Master Data Lokasi list/create/edit pages
│   │   ├── po/                       # Purchase Order list/create/edit pages
│   │   ├── resi/                     # Resi list/create/edit pages
│   │   └── layout.tsx                # Authenticated dashboard layout
│   ├── actions/                      # Server Actions
│   │   ├── finance.ts
│   │   ├── invoice.ts
│   │   ├── master-data-location.ts
│   │   ├── master-data.ts
│   │   ├── po.ts
│   │   └── resi.ts
│   ├── api/
│   │   └── auth/                     # Login/logout API routes
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── auth/                         # Auth and role guard components
│   ├── common/                       # Shared UI, DataTable, FileUpload
│   ├── dashboard/                    # Dashboard components
│   ├── finance/                      # Finance table
│   ├── invoice/                      # Invoice form/list components
│   ├── layout/                       # Sidebar and header
│   ├── master-data/                  # Master Data Item form/list components
│   ├── master-data-location/         # Master Data Lokasi form/list components
│   ├── po/                           # PO form/list components
│   ├── providers/                    # React providers
│   └── resi/                         # Resi form/list components
├── docs/
│   ├── archive/                      # Historical documentation
│   └── codex/                        # AI/Codex execution context
├── lib/
│   ├── auth-helpers.ts
│   ├── auth-server.ts
│   ├── authorization-client.ts
│   ├── authorization.ts
│   ├── excel-export.ts
│   ├── firebase-admin.ts
│   ├── firebase-client.ts
│   └── firebase-storage.ts
├── types/
│   └── models.ts                     # Shared TypeScript data models
├── AGENTS.md                         # Codex project instructions
├── firebase.json                     # Firebase deploy configuration
├── firestore.indexes.json            # Firestore composite indexes
├── firestore.rules                   # Firestore security rules
├── storage.rules                     # Firebase Storage security rules
├── middleware.ts                     # Route protection middleware
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts
└── tsconfig.json
```

## Key Directories

### `/app`
Next.js App Router directory. It contains pages, layouts, API routes, and Server Actions.

- `(auth)`: unauthenticated routes such as login.
- `(dashboard)`: authenticated dashboard pages.
- `actions`: data mutation and read helpers used by feature pages.
- `api/auth`: login and logout endpoints for session cookie handling.

### `/components`
React components grouped by feature area.

- `auth`: route and role guard components.
- `common`: reusable UI components such as `DataTable` and `FileUpload`.
- `layout`: dashboard shell components.
- `po`, `resi`, `invoice`, `finance`: feature-specific components.

### `/lib`
Shared application utilities.

- `firebase-client.ts`: Firebase client SDK initialization.
- `firebase-admin.ts`: Firebase Admin SDK initialization.
- `firebase-storage.ts`: Firebase Storage upload/delete/validation helpers.
- `auth-server.ts` and `auth-helpers.ts`: server-side auth utilities.
- `authorization.ts` and `authorization-client.ts`: RBAC helpers.
- `excel-export.ts`: Excel export utilities.

### `/types`
Shared TypeScript interfaces and domain models.

### `/docs/archive`
Historical documentation that is kept for reference but no longer describes the current application state.

### `/docs/codex`
AI/Codex execution context and command guardrails for this project.

## Route Groups

Next.js route groups are used to organize routes without changing URLs:

- `(auth)`: pages that do not require an authenticated session.
- `(dashboard)`: pages protected by middleware and dashboard layout.

## Firebase Files

- `firebase.json`: maps Firebase deploy targets to local rules/index files.
- `firestore.rules`: Firestore security rules.
- `storage.rules`: Firebase Storage security rules.
- `firestore.indexes.json`: composite indexes for Firestore queries.

Deploy them with:

```bash
firebase deploy --only firestore:rules,firestore:indexes,storage:rules
```

## Documentation Files

- `README.md`: project overview.
- `AGENTS.md`: Codex project instructions and guardrails.
- `docs/CODEX_PROMPT_TEMPLATES.md`: reusable prompt templates for feature work, improvements, refactors, bug fixes, Firebase tasks, and reviews.
- `SETUP_GUIDE.md`: setup instructions.
- `FIREBASE_SETUP_CHECKLIST.md`: Firebase setup checklist.
- `FIRESTORE_COLLECTIONS.md`: Firestore schema and relationships.
- `FIRESTORE_DEPLOYMENT_GUIDE.md`: rules and indexes deployment guide.
- `FILE_UPLOAD_IMPLEMENTATION.md`: Firebase Storage upload implementation summary.
- `FINAL_MVP_COMPLETION.md`: current MVP completion summary.
- `docs/codex/FIREBASE_EXECUTION_CONTEXT.md`: Firebase command execution workflow for Codex.
- `docs/archive/MVP_COMPLETION_SUMMARY.md`: older MVP summary kept for history.
