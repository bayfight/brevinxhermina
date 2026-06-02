# Authorization Components

This directory contains reusable authorization components for the PO-Resi-Invoice Dashboard.

## Components

### ProtectedRoute (Server Component)

Protects routes by checking authentication. Redirects to login if user is not authenticated.

**Usage:**
```tsx
import { ProtectedRoute } from '@/components/auth';

export default async function DashboardPage() {
  return (
    <ProtectedRoute>
      <div>Protected content here</div>
    </ProtectedRoute>
  );
}
```

### RoleGuard (Server Component)

Conditionally renders content based on user role. Shows "Access Denied" message if unauthorized.

**Usage:**
```tsx
import { RoleGuard } from '@/components/auth';

export default async function AdminPage() {
  return (
    <RoleGuard allowedRoles={['super_admin']}>
      <div>Admin-only content</div>
    </RoleGuard>
  );
}
```

**Props:**
- `children`: Content to render if authorized
- `allowedRoles`: Array of roles that can access the content
- `requireAuth`: If true, requires authentication (default: true)
- `fallback`: Custom content to show if unauthorized

### ClientRoleGuard (Client Component)

Client-side version of RoleGuard for use in client components. Uses auth context from AuthProvider.

**Usage:**
```tsx
'use client';

import { ClientRoleGuard } from '@/components/auth';

export function AdminButton() {
  return (
    <ClientRoleGuard allowedRoles={['super_admin']}>
      <button>Admin Action</button>
    </ClientRoleGuard>
  );
}
```

**Props:**
- `children`: Content to render if authorized
- `allowedRoles`: Array of roles that can access the content
- `requireAuth`: If true, requires authentication (default: true)
- `fallback`: Custom content to show if unauthorized
- `showLoading`: If true, shows loading state while checking auth (default: false)

## Providers

### AuthProvider

Client-side authentication provider that manages Firebase Auth state and provides user object and role to child components.

**Usage:**
```tsx
// In your root layout
import { AuthProvider } from '@/components/providers';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

### useAuth Hook

Hook to access auth context. Must be used within AuthProvider.

**Usage:**
```tsx
'use client';

import { useAuth } from '@/components/providers';

export function UserProfile() {
  const { user, role, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Not logged in</div>;

  return (
    <div>
      <p>Email: {user.email}</p>
      <p>Role: {role}</p>
    </div>
  );
}
```

## Authorization Utilities

The `lib/authorization.ts` file contains helper functions for checking permissions:

### Permission Check Functions

- `hasFullPOAccess(role)` - Check if user can create/update/delete POs
- `hasReadPOAccess(role)` - Check if user can read POs
- `hasFullResiAccess(role)` - Check if user can create/update/delete Resis
- `hasReadResiAccess(role)` - Check if user can read Resis
- `hasFullInvoiceAccess(role)` - Check if user can create/update/delete Invoices
- `hasReadInvoiceAccess(role)` - Check if user can read Invoices
- `hasFinanceAccess(role)` - Check if user can access Finance menu
- `canAccessCategory(role, category)` - Check if user can access a specific category
- `getAllowedCategories(role)` - Get array of categories user can access
- `isSuperAdmin(role)` - Check if user is Super Admin

**Usage in Server Actions:**
```tsx
'use server';

import { requireAuth } from '@/lib/auth-server';
import { hasFullPOAccess } from '@/lib/authorization';

export async function createPO(formData: FormData) {
  const user = await requireAuth();
  
  if (!hasFullPOAccess(user.role)) {
    return { success: false, error: 'Unauthorized' };
  }
  
  // Create PO logic...
}
```

## Role-Based Access Control Matrix

| Role | PO Access | Resi Access | Invoice Access | Finance Access |
|------|-----------|-------------|----------------|----------------|
| Super_Admin | Full CRUD | Full CRUD | Full CRUD | Full CRUD |
| Hermina_Account | Full CRUD | Read-only | Read-only | None |
| Staff_Account | Read-only | Full CRUD | None | None |
| Kopi_Merchant_Account | Read-only | Full CRUD | None | Read-only (kopi, aren) |
| Syrup_Merchant_Account | Read-only | Full CRUD | None | Read-only (syrup) |

## Examples

### Protecting a Dashboard Layout

```tsx
// app/(dashboard)/layout.tsx
import { ProtectedRoute } from '@/components/auth';

export default async function DashboardLayout({ children }) {
  return (
    <ProtectedRoute>
      <div className="dashboard-layout">
        <nav>Navigation</nav>
        <main>{children}</main>
      </div>
    </ProtectedRoute>
  );
}
```

### Conditional Navigation Items

```tsx
'use client';

import { ClientRoleGuard } from '@/components/auth';

export function Navigation() {
  return (
    <nav>
      <a href="/dashboard">Dashboard</a>
      <a href="/po">Purchase Orders</a>
      <a href="/resi">Resi</a>
      
      <ClientRoleGuard allowedRoles={['super_admin', 'hermina_account']}>
        <a href="/invoice">Invoices</a>
      </ClientRoleGuard>
      
      <ClientRoleGuard allowedRoles={['super_admin', 'kopi_merchant_account', 'syrup_merchant_account']}>
        <a href="/finance">Finance</a>
      </ClientRoleGuard>
    </nav>
  );
}
```

### Server-Side Role Check

```tsx
// app/(dashboard)/finance/page.tsx
import { RoleGuard } from '@/components/auth';

export default async function FinancePage() {
  return (
    <RoleGuard allowedRoles={['super_admin', 'kopi_merchant_account', 'syrup_merchant_account']}>
      <div>
        <h1>Finance Records</h1>
        {/* Finance content */}
      </div>
    </RoleGuard>
  );
}
```

### Category-Based Filtering

```tsx
'use server';

import { requireAuth } from '@/lib/auth-server';
import { getAllowedCategories } from '@/lib/authorization';

export async function listFinanceRecords() {
  const user = await requireAuth();
  const allowedCategories = getAllowedCategories(user.role);
  
  // Query only records in allowed categories
  const records = await db
    .collection('finance_records')
    .where('category', 'in', allowedCategories)
    .get();
  
  return records;
}
```
