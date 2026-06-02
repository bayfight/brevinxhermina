'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Resi, Category, ResiStatus, PurchaseOrder } from '@/types/models';
import { createResi, updateResi } from '@/app/actions/resi';
import { FileUpload } from '@/components/common/FileUpload';

interface ResiFormProps {
  mode: 'create' | 'edit' | 'view';
  initialData?: Resi;
  availablePOs: PurchaseOrder[];
}

export function ResiForm({ mode, initialData, availablePOs }: ResiFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    resiNumber: initialData?.resiNumber || '',
    poId: initialData?.poId || '',
    category: initialData?.category || ('kopi' as Category),
    senderPhone: initialData?.senderPhone || '',
    receiverPhone: initialData?.receiverPhone || '',
    status: initialData?.status || ('in_transit' as ResiStatus),
    receiptUrl: initialData?.receiptUrl || '',
    receiptFileName: initialData?.receiptFileName || '',
  });

  // Auto-update category when PO is selected
  useEffect(() => {
    if (formData.poId) {
      const selectedPO = availablePOs.find((po) => po.id === formData.poId);
      if (selectedPO) {
        setFormData((prev) => ({ ...prev, category: selectedPO.category }));
      }
    }
  }, [formData.poId, availablePOs]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const input = {
        resiNumber: formData.resiNumber,
        poId: formData.poId,
        category: formData.category,
        senderPhone: formData.senderPhone,
        receiverPhone: formData.receiverPhone,
        status: formData.status,
        receiptUrl: formData.receiptUrl,
        receiptFileName: formData.receiptFileName,
      };

      let result;
      if (mode === 'create') {
        result = await createResi(input);
      } else {
        result = await updateResi(initialData!.id, input);
      }

      if (result.success) {
        router.push('/resi');
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

  const handleFileUpload = (downloadURL: string, fileName: string) => {
    setFormData({
      ...formData,
      receiptUrl: downloadURL,
      receiptFileName: fileName,
    });
  };

  const isReadOnly = mode === 'view';

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      <div>
        <label htmlFor="resiNumber" className="block text-sm font-medium text-gray-700 mb-2">
          Resi Number <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="resiNumber"
          value={formData.resiNumber}
          onChange={(e) => setFormData({ ...formData, resiNumber: e.target.value })}
          disabled={isReadOnly}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          placeholder="e.g., RESI-2024-001"
        />
      </div>

      <div>
        <label htmlFor="poId" className="block text-sm font-medium text-gray-700 mb-2">
          Related PO <span className="text-red-500">*</span>
        </label>
        <select
          id="poId"
          value={formData.poId}
          onChange={(e) => setFormData({ ...formData, poId: e.target.value })}
          disabled={isReadOnly}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          <option value="">Select a PO</option>
          {availablePOs.map((po) => (
            <option key={po.id} value={po.id}>
              {po.poNumber} - {po.category}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
          Category <span className="text-red-500">*</span>
        </label>
        <select
          id="category"
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value as Category })}
          disabled={isReadOnly || !!formData.poId}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          <option value="kopi">Kopi</option>
          <option value="aren">Aren</option>
          <option value="syrup">Syrup</option>
        </select>
        {formData.poId && (
          <p className="text-xs text-gray-500 mt-1">Category is auto-filled from selected PO</p>
        )}
      </div>

      <div>
        <label htmlFor="senderPhone" className="block text-sm font-medium text-gray-700 mb-2">
          Sender Phone <span className="text-red-500">*</span>
        </label>
        <input
          type="tel"
          id="senderPhone"
          value={formData.senderPhone}
          onChange={(e) => setFormData({ ...formData, senderPhone: e.target.value })}
          disabled={isReadOnly}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          placeholder="e.g., +6281234567890"
        />
      </div>

      <div>
        <label htmlFor="receiverPhone" className="block text-sm font-medium text-gray-700 mb-2">
          Receiver Phone <span className="text-red-500">*</span>
        </label>
        <input
          type="tel"
          id="receiverPhone"
          value={formData.receiverPhone}
          onChange={(e) => setFormData({ ...formData, receiverPhone: e.target.value })}
          disabled={isReadOnly}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          placeholder="e.g., +6289876543210"
        />
      </div>

      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
          Status <span className="text-red-500">*</span>
        </label>
        <select
          id="status"
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value as ResiStatus })}
          disabled={isReadOnly}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          <option value="in_transit">In Transit</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {mode !== 'view' && (
        <FileUpload
          label="Receipt Photo"
          accept="image/*,.pdf"
          allowedExtensions={['jpg', 'jpeg', 'png', 'pdf', 'heic', 'webp']}
          maxSizeMB={10}
          storagePath={`resis/${formData.resiNumber || 'temp'}`}
          onUploadComplete={handleFileUpload}
          onUploadError={(error) => setError(error)}
          disabled={isReadOnly}
          currentFileURL={formData.receiptUrl}
          currentFileName={formData.receiptFileName}
        />
      )}

      {mode === 'view' && formData.receiptUrl && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Receipt Photo
          </label>
          <a
            href={formData.receiptUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            View Receipt
          </a>
        </div>
      )}

      <div className="flex items-center gap-4">
        {!isReadOnly && (
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Resi' : 'Update Resi'}
          </button>
        )}
        <button
          type="button"
          onClick={() => router.push('/resi')}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          {isReadOnly ? 'Back' : 'Cancel'}
        </button>
      </div>
    </form>
  );
}
