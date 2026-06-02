'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Resi } from '@/types/models';
import { DataTable, Column } from '@/components/common/DataTable';
import { deleteResi } from '@/app/actions/resi';
import { exportToExcel } from '@/lib/excel-export';

interface ResiListProps {
  resis: Resi[];
  canManage: boolean;
  currentCategory?: string;
}

export function ResiList({ resis, canManage, currentCategory }: ResiListProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string, resiNumber: string) => {
    if (!confirm(`Are you sure you want to delete Resi ${resiNumber}?`)) {
      return;
    }

    setIsDeleting(id);
    const result = await deleteResi(id);

    if (result.success) {
      router.refresh();
    } else {
      alert(`Failed to delete Resi: ${result.error.message}`);
      setIsDeleting(null);
    }
  };

  const handleExportExcel = () => {
    const exportData = resis.map((resi) => ({
      resiNumber: resi.resiNumber,
      category: resi.category,
      senderPhone: resi.senderPhone,
      receiverPhone: resi.receiverPhone,
      status: resi.status.replace('_', ' '),
      createdAt: new Date(resi.createdAt.seconds * 1000).toLocaleDateString(),
    }));

    exportToExcel(
      exportData,
      [
        { header: 'Resi Number', key: 'resiNumber', width: 20 },
        { header: 'Category', key: 'category', width: 15 },
        { header: 'Sender Phone', key: 'senderPhone', width: 20 },
        { header: 'Receiver Phone', key: 'receiverPhone', width: 20 },
        { header: 'Status', key: 'status', width: 15 },
        { header: 'Created Date', key: 'createdAt', width: 15 },
      ],
      `Resi_Records_${new Date().toISOString().split('T')[0]}`
    );
  };

  const columns: Column<Resi>[] = [
    {
      key: 'resiNumber',
      label: 'Resi Number',
      sortable: true,
    },
    {
      key: 'category',
      label: 'Category',
      sortable: true,
      render: (resi) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
          {resi.category}
        </span>
      ),
    },
    {
      key: 'senderPhone',
      label: 'Sender Phone',
      sortable: false,
    },
    {
      key: 'receiverPhone',
      label: 'Receiver Phone',
      sortable: false,
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (resi) => {
        const statusColors = {
          in_transit: 'bg-yellow-100 text-yellow-800',
          delivered: 'bg-green-100 text-green-800',
          cancelled: 'bg-red-100 text-red-800',
        };
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[resi.status]} capitalize`}>
            {resi.status.replace('_', ' ')}
          </span>
        );
      },
    },
    {
      key: 'createdAt',
      label: 'Created',
      sortable: true,
      render: (resi) => {
        const date = new Date(resi.createdAt.seconds * 1000);
        return date.toLocaleDateString();
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (resi) => (
        <div className="flex items-center gap-2">
          <Link
            href={`/resi/${resi.id}`}
            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
            title="View details"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            View
          </Link>
          {canManage && (
            <>
              <Link
                href={`/resi/${resi.id}`}
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 rounded-md hover:bg-green-100 transition-colors"
                title="Edit"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </Link>
              <button
                onClick={() => handleDelete(resi.id, resi.resiNumber)}
                disabled={isDeleting === resi.id}
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 rounded-md hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Delete"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                {isDeleting === resi.id ? 'Deleting...' : 'Delete'}
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const category = e.target.value;
    const url = new URL(window.location.href);
    if (category) {
      url.searchParams.set('category', category);
    } else {
      url.searchParams.delete('category');
    }
    window.location.href = url.toString();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <label htmlFor="categoryFilter" className="text-sm font-medium text-gray-700">
            Filter by Category:
          </label>
          <select
            id="categoryFilter"
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={currentCategory || ''}
            onChange={handleCategoryChange}
          >
            <option value="">All Categories</option>
            <option value="kopi">Kopi</option>
            <option value="aren">Aren</option>
            <option value="syrup">Syrup</option>
          </select>
        </div>

        <button
          onClick={handleExportExcel}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export to Excel
        </button>
      </div>

      <DataTable
        data={resis}
        columns={columns}
        searchPlaceholder="Search by resi number, phone, or category..."
        emptyMessage="No resi records found"
      />
    </div>
  );
}
