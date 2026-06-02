'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PurchaseOrder, Category } from '@/types/models';
import { createPO, updatePO } from '@/app/actions/po';
import { FileUpload } from '@/components/common/FileUpload';

interface POFormProps {
  mode: 'create' | 'edit' | 'view';
  initialData?: PurchaseOrder;
}

export function POForm({ mode, initialData }: POFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    poNumber: initialData?.poNumber || '',
    category: initialData?.category || ('kopi' as Category),
    supplier: initialData?.metadata?.supplier || '',
    fileUrl: initialData?.fileUrl || '',
    fileName: initialData?.fileName || '',
    fileSize: initialData?.fileSize || 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate file upload for create mode
    if (mode === 'create' && !formData.fileUrl) {
      setError('Please upload a PO file');
      return;
    }

    setIsSubmitting(true);

    try {
      const input = {
        poNumber: formData.poNumber,
        category: formData.category,
        fileUrl: formData.fileUrl,
        fileName: formData.fileName,
        fileSize: formData.fileSize,
        metadata: {
          supplier: formData.supplier,
        },
      };

      let result;
      if (mode === 'create') {
        result = await createPO(input);
      } else {
        result = await updatePO(initialData!.id, input);
      }

      if (result.success) {
        router.push('/po');
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

  const handleFileUpload = (downloadURL: string, fileName: string, fileSize: number) => {
    setFormData({
      ...formData,
      fileUrl: downloadURL,
      fileName: fileName,
      fileSize: fileSize,
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
        <label htmlFor="poNumber" className="block text-sm font-medium text-gray-700 mb-2">
          PO Number <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="poNumber"
          value={formData.poNumber}
          onChange={(e) => setFormData({ ...formData, poNumber: e.target.value })}
          disabled={isReadOnly}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          placeholder="e.g., PO-2024-001"
        />
      </div>

      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
          Category <span className="text-red-500">*</span>
        </label>
        <select
          id="category"
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value as Category })}
          disabled={isReadOnly}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          <option value="kopi">Kopi</option>
          <option value="aren">Aren</option>
          <option value="syrup">Syrup</option>
        </select>
      </div>

      <div>
        <label htmlFor="supplier" className="block text-sm font-medium text-gray-700 mb-2">
          Supplier
        </label>
        <input
          type="text"
          id="supplier"
          value={formData.supplier}
          onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
          disabled={isReadOnly}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          placeholder="e.g., Coffee Supplier A"
        />
      </div>

      {mode !== 'view' && (
        <FileUpload
          label="PO Document"
          accept=".pdf,application/pdf"
          allowedExtensions={['pdf']}
          maxSizeMB={10}
          storagePath={`purchase-orders/${formData.poNumber || 'temp'}`}
          onUploadComplete={handleFileUpload}
          onUploadError={(error) => setError(error)}
          disabled={isReadOnly}
          required={mode === 'create'}
          currentFileURL={formData.fileUrl}
          currentFileName={formData.fileName}
        />
      )}

      {mode === 'view' && formData.fileUrl && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            PO Document
          </label>
          <a
            href={formData.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            View PO Document
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
            {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create PO' : 'Update PO'}
          </button>
        )}
        <button
          type="button"
          onClick={() => router.push('/po')}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          {isReadOnly ? 'Back' : 'Cancel'}
        </button>
      </div>
    </form>
  );
}
