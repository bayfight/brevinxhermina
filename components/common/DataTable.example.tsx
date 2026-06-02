/**
 * Example usage of DataTable component
 * This file demonstrates how to use the DataTable component with different configurations
 */

import { DataTable, Column } from './DataTable';
import { PurchaseOrder } from '@/types/models';

// Example 1: Basic usage with Purchase Orders
export function POListExample({ orders }: { orders: PurchaseOrder[] }) {
  const columns: Column<PurchaseOrder>[] = [
    {
      key: 'poNumber',
      label: 'PO Number',
      sortable: true,
    },
    {
      key: 'category',
      label: 'Category',
      sortable: true,
      render: (order) => (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
          {order.category}
        </span>
      ),
    },
    {
      key: 'fileName',
      label: 'File Name',
      sortable: true,
    },
    {
      key: 'createdAt',
      label: 'Created At',
      sortable: true,
      render: (order) => new Date(order.createdAt.toDate()).toLocaleDateString(),
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (order) => (
        <div className="flex gap-2">
          <button className="text-blue-600 hover:text-blue-800">View</button>
          <button className="text-red-600 hover:text-red-800">Delete</button>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      data={orders}
      columns={columns}
      searchable={true}
      searchPlaceholder="Search by PO number, category, or file name..."
      itemsPerPage={10}
      emptyMessage="No purchase orders found"
    />
  );
}

// Example 2: Simple usage without search
interface SimpleItem {
  id: string;
  name: string;
  status: string;
}

export function SimpleTableExample({ items }: { items: SimpleItem[] }) {
  const columns: Column<SimpleItem>[] = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Name' },
    { key: 'status', label: 'Status' },
  ];

  return (
    <DataTable
      data={items}
      columns={columns}
      searchable={false}
      itemsPerPage={5}
    />
  );
}
