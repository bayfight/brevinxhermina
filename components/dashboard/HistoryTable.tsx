'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DataTable, Column } from '@/components/common/DataTable';
import { FileUpload } from '@/components/common/FileUpload';
import { updateInvoiceBillingLetter } from '@/app/actions/invoice';

export interface TransactionHistoryItem {
  id: string; // PO ID
  poNumber: string;
  poDate?: string;
  poFileUrl: string;
  poFileName: string;
  
  resiId?: string;
  resiNumber?: string;
  resiFileUrl?: string;
  
  invoiceId?: string;
  invoiceNumber?: string;
  deliveryNoteUrl?: string;
  receiptUrl?: string;
  billingLetterUrl?: string;
  
  status: 'wait_resi' | 'wait_invoice' | 'approval_done' | 'done';
}

interface HistoryTableProps {
  transactions: TransactionHistoryItem[];
  canManage: boolean;
}

export function HistoryTable({ transactions, canManage }: HistoryTableProps) {
  const router = useRouter();
  
  // States for Invoice Details Popup
  const [selectedInvoice, setSelectedInvoice] = useState<TransactionHistoryItem | null>(null);
  
  // States for Upload Billing Letter Popup
  const [uploadInvoice, setUploadInvoice] = useState<TransactionHistoryItem | null>(null);
  const [billingLetterUrl, setBillingLetterUrl] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleUploadComplete = (url: string) => {
    setBillingLetterUrl(url);
    setUploadError(null);
  };

  const handleUploadSubmit = async () => {
    if (!uploadInvoice || !uploadInvoice.invoiceId) return;
    if (!billingLetterUrl) {
      setUploadError('Please upload the billing letter file first');
      return;
    }

    setIsSubmitting(true);
    setUploadError(null);

    try {
      const result = await updateInvoiceBillingLetter(uploadInvoice.invoiceId, billingLetterUrl);
      if (result.success) {
        setUploadInvoice(null);
        setBillingLetterUrl('');
        router.refresh();
      } else {
        setUploadError(result.error.message);
      }
    } catch (err) {
      setUploadError('An unexpected error occurred while saving the billing letter');
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: Column<TransactionHistoryItem>[] = [
    {
      key: 'poNumber',
      label: 'Nomor PO',
      sortable: true,
      render: (item) => (
        <a
          href={item.poFileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 hover:underline font-medium inline-flex items-center gap-1"
          title={`View PO: ${item.poFileName}`}
        >
          {item.poNumber}
          <span className="text-xs">↗</span>
        </a>
      ),
    },
    {
      key: 'resiNumber',
      label: 'Nomor Resi',
      sortable: true,
      render: (item) => {
        if (!item.resiNumber || !item.resiFileUrl) {
          return <span className="text-gray-400">—</span>;
        }
        return (
          <a
            href={item.resiFileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 hover:underline font-medium inline-flex items-center gap-1"
            title="View Resi file"
          >
            {item.resiNumber}
            <span className="text-xs">↗</span>
          </a>
        );
      },
    },
    {
      key: 'invoiceNumber',
      label: 'Nomor Invoice',
      sortable: true,
      render: (item) => {
        if (!item.invoiceNumber || !item.invoiceId) {
          return <span className="text-gray-400">—</span>;
        }
        return (
          <button
            onClick={() => setSelectedInvoice(item)}
            className="text-blue-600 hover:text-blue-800 hover:underline font-medium inline-flex items-center gap-1 text-left"
            title="Click to view Invoice documents"
          >
            {item.invoiceNumber}
            <span className="text-xs">📋</span>
          </button>
        );
      },
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (item) => {
        const statusMap = {
          wait_resi: { label: 'Wait Resi', class: 'bg-amber-100 text-amber-800 border-amber-200' },
          wait_invoice: { label: 'Wait Invoice', class: 'bg-blue-100 text-blue-800 border-blue-200' },
          approval_done: { label: 'Approval Done', class: 'bg-purple-100 text-purple-800 border-purple-200' },
          done: { label: 'Done', class: 'bg-green-100 text-green-800 border-green-200' },
        };

        const config = statusMap[item.status] || { label: item.status, class: 'bg-gray-100 text-gray-800' };

        return (
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${config.class}`}>
            {config.label}
          </span>
        );
      },
    },
    {
      key: 'id', // acts as actions column
      label: 'Aksi',
      sortable: false,
      render: (item) => {
        if (item.status === 'approval_done' && canManage) {
          return (
            <button
              onClick={() => {
                setUploadInvoice(item);
                setBillingLetterUrl(item.billingLetterUrl || '');
                setUploadError(null);
              }}
              className="inline-flex items-center justify-center p-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg border border-green-200 shadow-sm active:scale-95 transition-all duration-200"
              title="Upload Surat Penagihan"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </button>
          );
        }
        return <span className="text-gray-400">—</span>;
      },
    },
  ];

  return (
    <div className="space-y-4">
      <DataTable
        data={transactions}
        columns={columns}
        searchPlaceholder="Cari berdasarkan nomor PO, Resi, atau Invoice..."
        emptyMessage="Belum ada riwayat transaksi."
      />

      {/* Popup Modal 1: View Invoice Documents */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 transition-opacity duration-300">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative transform transition-transform duration-300 scale-100">
            <button
              onClick={() => setSelectedInvoice(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Dokumen Invoice: {selectedInvoice.invoiceNumber}
            </h3>

            <div className="space-y-4 mt-2">
              {/* Delivery Note */}
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm text-gray-800">Delivery Note (Surat Jalan)</p>
                  <p className="text-xs text-gray-500">Bukti penyerahan barang ke RS</p>
                </div>
                {selectedInvoice.deliveryNoteUrl ? (
                  <a
                    href={selectedInvoice.deliveryNoteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-1 shadow-sm"
                  >
                    View ↗
                  </a>
                ) : (
                  <span className="text-xs text-gray-400">Not found</span>
                )}
              </div>

              {/* Receipt */}
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm text-gray-800">Receipt (Struk)</p>
                  <p className="text-xs text-gray-500">Bukti struk/penerimaan internal</p>
                </div>
                {selectedInvoice.receiptUrl ? (
                  <a
                    href={selectedInvoice.receiptUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-1 shadow-sm"
                  >
                    View ↗
                  </a>
                ) : (
                  <span className="text-xs text-gray-400">Not found</span>
                )}
              </div>

              {/* Surat Penagihan */}
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm text-gray-800">Surat Penagihan</p>
                  <p className="text-xs text-gray-500">Dokumen penagihan resmi</p>
                </div>
                {selectedInvoice.billingLetterUrl ? (
                  <a
                    href={selectedInvoice.billingLetterUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700 transition-colors inline-flex items-center gap-1 shadow-sm"
                  >
                    View ↗
                  </a>
                ) : (
                  <span className="text-xs text-gray-400">Belum di-upload</span>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedInvoice(null)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Popup Modal 2: Upload Surat Penagihan */}
      {uploadInvoice && uploadInvoice.invoiceId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 transition-opacity duration-300">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 relative transform transition-transform duration-300 scale-100">
            <button
              onClick={() => setUploadInvoice(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Upload Surat Penagihan
            </h3>
            <p className="text-xs text-gray-500 mb-6">
              Untuk Invoice: <span className="font-semibold text-gray-700">{uploadInvoice.invoiceNumber}</span> (PO: {uploadInvoice.poNumber})
            </p>

            {uploadError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-red-800 text-xs">{uploadError}</p>
              </div>
            )}

            <div className="space-y-4">
              <FileUpload
                label="Surat Penagihan (PDF / Image)"
                accept=".pdf,image/*,application/pdf"
                allowedExtensions={['pdf', 'jpg', 'jpeg', 'png']}
                maxSizeMB={10}
                storagePath={`invoices/${uploadInvoice.invoiceNumber}/billing-letter`}
                onUploadComplete={handleUploadComplete}
                onUploadError={(err) => setUploadError(err)}
                required={true}
                currentFileURL={billingLetterUrl}
                currentFileName="Surat Penagihan"
              />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setUploadInvoice(null)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUploadSubmit}
                disabled={!billingLetterUrl || isSubmitting}
                className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold shadow-sm"
              >
                {isSubmitting ? 'Saving...' : 'Done'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
