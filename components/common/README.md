# Common UI Components

This directory contains reusable UI components used throughout the PO-Resi-Invoice Dashboard application.

## DataTable Component

A fully-featured data table component with sorting, pagination, and search functionality.

### Features

- **Sorting**: Click column headers to sort data (ascending/descending/none)
- **Pagination**: Navigate through large datasets with configurable items per page
- **Search**: Filter data across all columns with real-time search
- **Custom Rendering**: Use custom render functions for complex cell content
- **Responsive**: Works on mobile and desktop devices
- **Type-safe**: Full TypeScript support with generics

### Props

```typescript
interface DataTableProps<T> {
  data: T[];                    // Array of data items to display
  columns: Column<T>[];         // Column definitions
  searchable?: boolean;         // Enable/disable search (default: true)
  searchPlaceholder?: string;   // Search input placeholder
  itemsPerPage?: number;        // Items per page (default: 10)
  emptyMessage?: string;        // Message when no data (default: "No data available")
}

interface Column<T> {
  key: string;                  // Property key from data item
  label: string;                // Column header label
  sortable?: boolean;           // Enable/disable sorting (default: true)
  render?: (item: T) => React.ReactNode;  // Custom render function
}
```

### Usage Example

```tsx
import { DataTable, Column } from '@/components/common';
import { PurchaseOrder } from '@/types/models';

const columns: Column<PurchaseOrder>[] = [
  {
    key: 'poNumber',
    label: 'PO Number',
    sortable: true,
  },
  {
    key: 'category',
    label: 'Category',
    render: (order) => (
      <span className="badge">{order.category}</span>
    ),
  },
];

<DataTable
  data={orders}
  columns={columns}
  searchable={true}
  itemsPerPage={10}
/>
```

### Styling

The component uses Tailwind CSS classes and follows the application's design system. Key classes:

- Table container: `bg-white rounded-lg shadow`
- Headers: `bg-gray-50 border-b border-gray-200`
- Rows: `hover:bg-gray-50`
- Pagination: `border-t border-gray-200`

### Accessibility

- Keyboard navigation support
- Semantic HTML table structure
- ARIA labels for interactive elements
- Focus indicators on buttons

## Future Components

### FileUpload Component (Planned)

Will be implemented when Firebase Storage is enabled. Features will include:

- Drag-and-drop file upload
- Progress tracking
- File type and size validation
- Firebase Storage integration
- Preview for uploaded files

See `DataTable.example.tsx` for more usage examples.
