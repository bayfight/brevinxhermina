'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Invoice } from '@/types/models';
import { DataTable, Column } from '@/components/common/DataTable';
import { deleteInvoice } from '@/app/actions/invoice';
import { exportToExcel } from '@/lib/excel-export';

interface InvoiceListProps {
  invoices: Invoice[];
  canManage: boolean;
}

export function InvoiceList({ invoices, canManage }: InvoiceListProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string, invoiceNumber: string) => {
    if (!confirm(`Are you sure you want to delete Invoice ${invoiceNumber}?`)) {
      return;
    }

    setIsDeleting(id);
    const result = await deleteInvoice(id);

    if (result.success) {
      router.refresh();
    } else {
      alert(`Failed to delete Invoice: ${result.error.message}`);
      setIsDeleting(null);
    }
  };

  const handleExportExcel = () => {
    const exportData = invoices.map((invoice) => ({
      invoiceNumber: invoice.invoiceNumber,
      resiNumber: invoice.resiNumber,
      totalAmount: invoice.totalAmount
        ? new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
          }).format(invoice.totalAmount)
        : '—',
      createdAt: new Date(invoice.createdAt.seconds * 1000).toLocaleDateString(),
    }));

    exportToExcel(
      exportData,
      [
        { header: 'Invoice Number', key: 'invoiceNumber', width: 20 },
        { header: 'Resi Number', key: 'resiNumber', width: 20 },
        { header: 'Total Amount', key: 'totalAmount', width: 20 },
        { header: 'Created Date', key: 'createdAt', width: 15 },
      ],
      `Invoices_${new Date().toISOString().split('T')[0]}`
    );
  };

  const columns: Column<Invoice>[] = [
    {
      key: 'invoiceNumber',
      label: 'Invoice Number',
      sortable: true,
    },
    {
      key: 'resiNumber',
      label: 'Resi Number',
      sortable: true,
    },
    {
      key: 'totalAmount',
      label: 'Total Amount',
      sortable: true,
      render: (invoice) => {
        if (invoice.totalAmount) {
          return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
          }).format(invoice.totalAmount);
        }
        return '—';
      },
    },
    {
      key: 'createdAt',
      label: 'Created',
      sortable: true,
      render: (invoice) => {
        const date = new Date(invoice.createdAt.seconds * 1000);
        return date.toLocaleDateString();
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (invoice) => (
        <div className="flex items-center gap-2">
          <Link
            href={`/invoice/${invoice.id}`}
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
                href={`/invoice/${invoice.id}`}
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 rounded-md hover:bg-green-100 transition-colors"
                title="Edit"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </Link>
              <button
                onClick={() => handleDelete(invoice.id, invoice.invoiceNumber)}
                disabled={isDeleting === invoice.id}
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 rounded-md hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Delete"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                {isDeleting === invoice.id ? 'Deleting...' : 'Delete'}
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
        data={invoices}
        columns={columns}
        searchPlaceholder="Search by invoice number or resi number..."
        emptyMessage="No invoices found"
      />
    </div>
  );
}
