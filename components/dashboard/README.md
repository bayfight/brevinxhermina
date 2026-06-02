# Dashboard Components

This directory contains components specific to the dashboard feature of the PO-Resi-Invoice Dashboard application.

## StatCard Component

A reusable card component for displaying key metrics and statistics on the dashboard.

### Features

- **Flexible Display**: Show counts, currency, or any metric
- **Icon Support**: Optional icon display with customizable content
- **Clickable Links**: Optional link to related pages
- **Trend Indicators**: Show positive/negative trends with percentages
- **Description**: Optional subtitle for additional context
- **Hover Effects**: Smooth transitions for better UX

### Props

```typescript
interface StatCardProps {
  title: string;                // Card title (e.g., "Incoming POs")
  count: number | string;       // Main metric value
  icon?: React.ReactNode;       // Optional icon element
  link?: string;                // Optional link URL (makes card clickable)
  description?: string;         // Optional description text
  trend?: {                     // Optional trend indicator
    value: number;              // Percentage value
    isPositive: boolean;        // Green (true) or red (false)
  };
}
```

### Usage Examples

#### Basic Stat Card with Icon and Link

```tsx
import { StatCard } from '@/components/dashboard';

<StatCard
  title="Incoming POs"
  count={24}
  icon={<DocumentIcon />}
  link="/po"
  description="Active purchase orders"
/>
```

#### Stat Card with Trend

```tsx
<StatCard
  title="Total Revenue"
  count="$45,231"
  trend={{ value: 12.5, isPositive: true }}
  description="Compared to last month"
/>
```

#### Simple Stat Card

```tsx
<StatCard
  title="Total Users"
  count={156}
  description="Registered users"
/>
```

#### Dashboard Grid Layout

```tsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  <StatCard title="Incoming POs" count={24} link="/po" />
  <StatCard title="Resi in Transit" count={12} link="/resi" />
  <StatCard title="Invoices Sent" count={8} link="/invoice" />
</div>
```

### Styling

The component uses Tailwind CSS and follows the application's design system:

- Card: `bg-white rounded-lg shadow p-6`
- Hover: `hover:shadow-lg transition-shadow`
- Icon container: `w-12 h-12 bg-blue-100 rounded-lg`
- Count: `text-3xl font-semibold text-gray-900`
- Trend positive: `text-green-600`
- Trend negative: `text-red-600`

### Design Decisions

1. **Clickable Cards**: When a `link` prop is provided, the entire card becomes clickable using Next.js `Link` component for optimal navigation.

2. **Icon Flexibility**: The `icon` prop accepts any React node, allowing you to use any icon library (Heroicons, Lucide, custom SVGs, etc.).

3. **Responsive Layout**: Cards work well in grid layouts and automatically adjust to different screen sizes.

4. **Visual Hierarchy**: The count is the most prominent element, followed by the title and optional description.

### Accessibility

- Semantic HTML structure
- Proper heading hierarchy
- Keyboard navigation support for links
- Focus indicators
- Color contrast meets WCAG AA standards

### Integration with Dashboard

The StatCard component is designed to be used in the main dashboard page (`app/(dashboard)/dashboard/page.tsx`) to display:

1. **Incoming POs**: Count of active purchase orders
2. **Resi in Transit**: Count of shipments being delivered
3. **Invoices Sent**: Count of invoices pending payment

Each card links to its respective management page for quick navigation.

See `StatCard.example.tsx` for more usage examples.
