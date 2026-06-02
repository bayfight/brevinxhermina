'use client';

import { FinanceRecord } from '@/types/models';
import { DataTable, Column } from '@/components/common/DataTable';
import { exportToExcel } from '@/lib/excel-export';

interface FinanceTableProps {
  records: FinanceRecord[];
}

export function FinanceTable({ records }: FinanceTableProps) {
  const handleExportExcel = () => {
    const exportData = records.map((record) => ({
      invoiceId: record.invoiceId,
      category: record.category,
      amount: new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
      }).format(record.amount),
      paymentStatus: record.paymentStatus,
      paidAt: record.paidAt
        ? new Date(record.paidAt.seconds * 1000).toLocaleDateString()
        : '—',
      createdAt: new Date(record.createdAt.seconds * 1000).toLocaleDateString(),
    }));

    exportToExcel(
      exportData,
      [
        { header: 'Invoice ID', key: 'invoiceId', width: 20 },
        { header: 'Category', key: 'category', width: 15 },
        { header: 'Amount', key: 'amount', width: 20 },
        { header: 'Payment Status', key: 'paymentStatus', width: 15 },
        { header: 'Paid At', key: 'paidAt', width: 15 },
        { header: 'Created Date', key: 'createdAt', width: 15 },
      ],
      `Finance_Records_${new Date().toISOString().split('T')[0]}`
    );
  };
  const columns: Column<FinanceRecord>[] = [
    {
      key: 'invoiceId',
      label: 'Invoice ID',
      sortable: true,
    },
    {
      key: 'category',
      label: 'Category',
      sortable: true,
      render: (record) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
          {record.category}
        </span>
      ),
    },
    {
      key: 'amount',
      label: 'Amount',
      sortable: true,
      render: (record) => {
        return new Intl.NumberFormat('id-ID', {
          style: 'currency',
          currency: 'IDR',
        }).format(record.amount);
      },
    },
    {
      key: 'paymentStatus',
      label: 'Payment Status',
      sortable: true,
      render: (record) => {
        const statusColors = {
          paid: 'bg-green-100 text-green-800',
          unpaid: 'bg-yellow-100 text-yellow-800',
        };
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[record.paymentStatus]} capitalize`}>
            {record.paymentStatus}
          </span>
        );
      },
    },
    {
      key: 'paidAt',
      label: 'Paid At',
      sortable: true,
      render: (record) => {
        if (record.paidAt) {
          const date = new Date(record.paidAt.seconds * 1000);
          return date.toLocaleDateString();
        }
        return '—';
      },
    },
    {
      key: 'createdAt',
      label: 'Created',
      sortable: true,
      render: (record) => {
        const date = new Date(record.createdAt.seconds * 1000);
        return date.toLocaleDateString();
      },
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
        data={records}
        columns={columns}
        searchPlaceholder="Search by invoice ID or category..."
        emptyMessage="No finance records found"
      />
    </div>
  );
}
