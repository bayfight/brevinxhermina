'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PurchaseOrder } from '@/types/models';
import { DataTable, Column } from '@/components/common/DataTable';
import { deletePO } from '@/app/actions/po';
import { exportToExcel } from '@/lib/excel-export';

interface POListProps {
  pos: PurchaseOrder[];
  canManage: boolean;
}

export function POList({ pos, canManage }: POListProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string, poNumber: string) => {
    if (!confirm(`Are you sure you want to delete PO ${poNumber}?`)) {
      return;
    }

    setIsDeleting(id);
    const result = await deletePO(id);

    if (result.success) {
      router.refresh();
    } else {
      alert(`Failed to delete PO: ${result.error.message}`);
      setIsDeleting(null);
    }
  };

  const handleExportExcel = () => {
    const exportData = pos.map((po) => ({
      poNumber: po.poNumber,
      poDate: po.poDate || '—',
      category: po.category,
      fileName: po.fileName,
      herminaLocation: po.herminaLocation || '—',
      createdAt: new Date(po.createdAt.seconds * 1000).toLocaleDateString(),
    }));

    exportToExcel(
      exportData,
      [
        { header: 'PO Number', key: 'poNumber', width: 20 },
        { header: 'PO Date', key: 'poDate', width: 15 },
        { header: 'Category', key: 'category', width: 15 },
        { header: 'File Name', key: 'fileName', width: 30 },
        { header: 'RS Hermina', key: 'herminaLocation', width: 25 },
        { header: 'Created Date', key: 'createdAt', width: 15 },
      ],
      `Purchase_Orders_${new Date().toISOString().split('T')[0]}`
    );
  };

  const columns: Column<PurchaseOrder>[] = [
    {
      key: 'poNumber',
      label: 'PO Number',
      sortable: true,
    },
    {
      key: 'poDate',
      label: 'PO Date',
      sortable: true,
      render: (po) => po.poDate || '—',
    },
    {
      key: 'herminaLocation',
      label: 'RS Hermina',
      sortable: true,
      render: (po) => po.herminaLocation || '—',
    },
    {
      key: 'fileName',
      label: 'File',
      sortable: false,
    },
    {
      key: 'createdAt',
      label: 'Created',
      sortable: true,
      render: (po) => {
        const date = new Date(po.createdAt.seconds * 1000);
        return date.toLocaleDateString();
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (po) => (
        <div className="flex items-center gap-2">
          <a
            href={po.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
            title="View PO File"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>

          </a>
          {canManage && (
            <>
              <Link
                href={`/po/${po.id}`}
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 rounded-md hover:bg-green-100 transition-colors"
                title="Edit"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>

              </Link>
              <button
                onClick={() => handleDelete(po.id, po.poNumber)}
                disabled={isDeleting === po.id}
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 rounded-md hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Delete"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>

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
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export to Excel
        </button>
      </div>

      <DataTable
        data={pos}
        columns={columns}
        searchPlaceholder="Search by PO number, category, or file name..."
        emptyMessage="No purchase orders found"
      />
    </div>
  );
}
