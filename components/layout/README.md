# Layout Components

This directory contains the layout components for the dashboard interface.

## Components

### Sidebar

The `Sidebar` component provides role-based navigation for the dashboard.

**Features:**
- Displays navigation menu items based on user role
- Highlights active route
- Shows/hides menu items according to authorization rules
- Responsive design

**Props:**
- `userRole: UserRole | null` - The current user's role

**Menu Items:**
- **Dashboard** - Available to all roles
- **Purchase Orders** - Available to all roles
- **Resi** - Available to all roles
- **Invoice** - Available to Super Admin and Hermina only
- **Finance** - Available to Super Admin and Merchants only

**Usage:**
```tsx
import { Sidebar } from '@/components/layout/Sidebar';

<Sidebar userRole={user.role} />
```

### Header

The `Header` component displays user information and logout functionality.

**Features:**
- Displays user email and formatted role name
- Logout button with loading state
- Handles logout API call and redirect

**Props:**
- `userEmail: string | null` - The current user's email
- `userRole: string | null` - The current user's role

**Usage:**
```tsx
import { Header } from '@/components/layout/Header';

<Header userEmail={user.email} userRole={user.role} />
```

## Layout Structure

The dashboard layout (`app/(dashboard)/layout.tsx`) combines these components:

```
┌─────────────────────────────────────────┐
│              Header                      │
├──────────┬──────────────────────────────┤
│          │                              │
│ Sidebar  │        Main Content          │
│          │                              │
│          │                              │
└──────────┴──────────────────────────────┘
```

## Authorization

The sidebar uses authorization helper functions from `lib/authorization.ts`:
- `hasInvoiceAccess()` - Checks if user can access Invoice menu
- `hasFinanceAccess()` - Checks if user can access Finance menu

## Styling

Components use Tailwind CSS for styling with:
- Responsive design (mobile-first approach)
- Hover states for interactive elements
- Active state highlighting for current route
- Consistent color scheme (blue for primary, gray for neutral)

## Future Enhancements

- Add mobile menu toggle for responsive navigation
- Add user avatar/profile picture
- Add notification badge for pending items
- Add breadcrumb navigation
- Add search functionality in header
