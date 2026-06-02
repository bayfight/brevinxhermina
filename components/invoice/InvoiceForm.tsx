'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Invoice, Category, Resi } from '@/types/models';
import { createInvoice, updateInvoice } from '@/app/actions/invoice';
import { FileUpload } from '@/components/common/FileUpload';

interface InvoiceFormProps {
  mode: 'create' | 'edit' | 'view';
  initialData?: Invoice;
  availableResis: Resi[];
}

export function InvoiceForm({ mode, initialData, availableResis }: InvoiceFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    invoiceNumber: initialData?.invoiceNumber || '',
    resiId: initialData?.resiId || '',
    category: initialData?.category || ('kopi' as Category),
    totalAmount: initialData?.totalAmount?.toString() || '',
    invoiceTemplateUrl: initialData?.invoiceTemplateUrl || '',
    deliveryNoteUrl: initialData?.deliveryNoteUrl || '',
    receiptUrl: initialData?.receiptUrl || '',
  });

  // Auto-update category when Resi is selected
  useEffect(() => {
    if (formData.resiId) {
      const selectedResi = availableResis.find((resi) => resi.id === formData.resiId);
      if (selectedResi) {
        setFormData((prev) => ({ ...prev, category: selectedResi.category }));
      }
    }
  }, [formData.resiId, availableResis]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate file uploads for create mode
    if (mode === 'create') {
      if (!formData.invoiceTemplateUrl) {
        setError('Please upload Invoice Template');
        return;
      }
      if (!formData.deliveryNoteUrl) {
        setError('Please upload Delivery Note');
        return;
      }
      if (!formData.receiptUrl) {
        setError('Please upload Receipt');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const input = {
        invoiceNumber: formData.invoiceNumber,
        resiId: formData.resiId,
        category: formData.category,
        totalAmount: formData.totalAmount ? parseFloat(formData.totalAmount) : undefined,
        invoiceTemplateUrl: formData.invoiceTemplateUrl,
        deliveryNoteUrl: formData.deliveryNoteUrl,
        receiptUrl: formData.receiptUrl,
      };

      let result;
      if (mode === 'create') {
        result = await createInvoice(input);
      } else {
        result = await updateInvoice(initialData!.id, input);
      }

      if (result.success) {
        router.push('/invoice');
        router.refresh();
      } else {
        setError(result.error.message);
        setIsSubmitting(false);
      }
    } catch (err) {
      setError('An unexpected error occurred');
      setIsSubmitting(false);
    }
  };

  const handleInvoiceTemplateUpload = (downloadURL: string) => {
    setFormData({ ...formData, invoiceTemplateUrl: downloadURL });
  };

  const handleDeliveryNoteUpload = (downloadURL: string) => {
    setFormData({ ...formData, deliveryNoteUrl: downloadURL });
  };

  const handleReceiptUpload = (downloadURL: string) => {
    setFormData({ ...formData, receiptUrl: downloadURL });
  };

  const isReadOnly = mode === 'view';
  const selectedResi = availableResis.find((r) => r.id === formData.resiId);

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      <div>
        <label htmlFor="invoiceNumber" className="block text-sm font-medium text-gray-700 mb-2">
          Invoice Number <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="invoiceNumber"
          value={formData.invoiceNumber}
          onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
          disabled={isReadOnly}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          placeholder="e.g., INV-2024-001"
        />
      </div>

      <div>
        <label htmlFor="resiId" className="block text-sm font-medium text-gray-700 mb-2">
          Related Resi <span className="text-red-500">*</span>
        </label>
        <select
          id="resiId"
          value={formData.resiId}
          onChange={(e) => setFormData({ ...formData, resiId: e.target.value })}
          disabled={isReadOnly}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          <option value="">Select a Resi</option>
          {availableResis.map((resi) => (
            <option key={resi.id} value={resi.id}>
              {resi.resiNumber} - {resi.category}
            </option>
          ))}
        </select>
        {selectedResi && (
          <div className="mt-2 p-3 bg-gray-50 rounded-lg text-sm">
            <p className="text-gray-700">
              <strong>PO ID:</strong> {selectedResi.poId}
            </p>
            <p className="text-gray-700">
              <strong>Resi Number:</strong> {selectedResi.resiNumber}
            </p>
          </div>
        )}
      </div>

      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
          Category <span className="text-red-500">*</span>
        </label>
        <select
          id="category"
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value as Category })}
          disabled={isReadOnly || !!formData.resiId}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          <option value="kopi">Kopi</option>
          <option value="aren">Aren</option>
          <option value="syrup">Syrup</option>
        </select>
        {formData.resiId && (
          <p className="text-xs text-gray-500 mt-1">Category is auto-filled from selected Resi</p>
        )}
      </div>

      <div>
        <label htmlFor="totalAmount" className="block text-sm font-medium text-gray-700 mb-2">
          Total Amount (IDR)
        </label>
        <input
          type="number"
          id="totalAmount"
          value={formData.totalAmount}
          onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
          disabled={isReadOnly}
          min="0"
          step="1000"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          placeholder="e.g., 5000000"
        />
      </div>

      {/* File Uploads */}
      {mode !== 'view' && (
        <>
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Document Uploads</h3>
            
            <div className="space-y-6">
              <FileUpload
                label="Invoice Template"
                accept=".pdf,application/pdf"
                allowedExtensions={['pdf']}
                maxSizeMB={10}
                storagePath={`invoices/${formData.invoiceNumber || 'temp'}/template`}
                onUploadComplete={handleInvoiceTemplateUpload}
                onUploadError={(error) => setError(error)}
                disabled={isReadOnly}
                required={mode === 'create'}
                currentFileURL={formData.invoiceTemplateUrl}
                currentFileName="Invoice Template"
              />

              <FileUpload
                label="Delivery Note"
                accept=".pdf,application/pdf"
                allowedExtensions={['pdf']}
                maxSizeMB={10}
                storagePath={`invoices/${formData.invoiceNumber || 'temp'}/delivery-note`}
                onUploadComplete={handleDeliveryNoteUpload}
                onUploadError={(error) => setError(error)}
                disabled={isReadOnly}
                required={mode === 'create'}
                currentFileURL={formData.deliveryNoteUrl}
                currentFileName="Delivery Note"
              />

              <FileUpload
                label="Receipt"
                accept=".pdf,application/pdf"
                allowedExtensions={['pdf']}
                maxSizeMB={10}
                storagePath={`invoices/${formData.invoiceNumber || 'temp'}/receipt`}
                onUploadComplete={handleReceiptUpload}
                onUploadError={(error) => setError(error)}
                disabled={isReadOnly}
                required={mode === 'create'}
                currentFileURL={formData.receiptUrl}
                currentFileName="Receipt"
              />
            </div>
          </div>
        </>
      )}

      {/* View mode file links */}
      {mode === 'view' && (
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Documents</h3>
          <div className="space-y-3">
            {formData.invoiceTemplateUrl && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Invoice Template
                </label>
                <a
                  href={formData.invoiceTemplateUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  View Invoice Template
                </a>
              </div>
            )}
            
            {formData.deliveryNoteUrl && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delivery Note
                </label>
                <a
                  href={formData.deliveryNoteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  View Delivery Note
                </a>
              </div>
            )}
            
            {formData.receiptUrl && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Receipt
                </label>
                <a
                  href={formData.receiptUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  View Receipt
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center gap-4">
        {!isReadOnly && (
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Invoice' : 'Update Invoice'}
          </button>
        )}
        <button
          type="button"
          onClick={() => router.push('/invoice')}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          {isReadOnly ? 'Back' : 'Cancel'}
        </button>
      </div>
    </form>
  );
}
