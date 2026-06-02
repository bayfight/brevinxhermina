'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DataTable, Column } from '@/components/common/DataTable';
import { deleteMasterDataItem } from '@/app/actions/master-data';
import { exportToExcel } from '@/lib/excel-export';
import { MasterDataItem } from '@/types/models';

interface MasterDataItemListProps {
  items: MasterDataItem[];
  canManage: boolean;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value);
}

export function MasterDataItemList({ items, canManage }: MasterDataItemListProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string, itemCode: string) => {
    if (!confirm(`Are you sure you want to delete item ${itemCode}?`)) {
      return;
    }

    setIsDeleting(id);
    const result = await deleteMasterDataItem(id);

    if (result.success) {
      router.refresh();
    } else {
      alert(`Failed to delete item: ${result.error.message}`);
      setIsDeleting(null);
    }
  };

  const handleExportExcel = () => {
    const exportData = items.map((item) => ({
      itemCode: item.itemCode,
      name: item.name,
      category: item.category,
      unit: item.unit,
      price: item.price,
      status: item.status,
      description: item.description || '',
      createdAt: new Date(item.createdAt.seconds * 1000).toLocaleDateString(),
    }));

    exportToExcel(
      exportData,
      [
        { header: 'Item Code', key: 'itemCode', width: 18 },
        { header: 'Item Name', key: 'name', width: 32 },
        { header: 'Category', key: 'category', width: 14 },
        { header: 'Unit', key: 'unit', width: 12 },
        { header: 'Price', key: 'price', width: 16 },
        { header: 'Status', key: 'status', width: 14 },
        { header: 'Description', key: 'description', width: 40 },
        { header: 'Created Date', key: 'createdAt', width: 16 },
      ],
      `Master_Data_Items_${new Date().toISOString().split('T')[0]}`
    );
  };

  const columns: Column<MasterDataItem>[] = [
    {
      key: 'itemCode',
      label: 'Item Code',
      sortable: true,
    },
    {
      key: 'name',
      label: 'Item Name',
      sortable: true,
    },
    {
      key: 'category',
      label: 'Category',
      sortable: true,
      render: (item) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
          {item.category}
        </span>
      ),
    },
    {
      key: 'unit',
      label: 'Unit',
      sortable: true,
    },
    {
      key: 'price',
      label: 'Price',
      sortable: true,
      render: (item) => formatCurrency(item.price),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (item) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
            item.status === 'active'
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {item.status}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (item) => (
        <div className="flex items-center gap-2">
          <Link
            href={`/master-data/${item.id}`}
            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
            title="View details"
          >
            View
          </Link>
          {canManage && (
            <>
              <Link
                href={`/master-data/${item.id}`}
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 rounded-md hover:bg-green-100 transition-colors"
                title="Edit"
              >
                Edit
              </Link>
              <button
                onClick={() => handleDelete(item.id, item.itemCode)}
                disabled={isDeleting === item.id}
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 rounded-md hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Delete"
              >
                {isDeleting === item.id ? 'Deleting...' : 'Delete'}
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={handleExportExcel}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
        >
          Export to Excel
        </button>
      </div>

      <DataTable
        data={items}
        columns={columns}
        searchPlaceholder="Search by item code, name, category, unit, or status..."
        emptyMessage="No master data items found"
      />
    </div>
  );
}
