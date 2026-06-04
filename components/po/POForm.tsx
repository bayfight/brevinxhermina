'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PurchaseOrder, Category, MasterDataLocation } from '@/types/models';
import { createPO, updatePO } from '@/app/actions/po';
import { FileUpload } from '@/components/common/FileUpload';
import { SearchableSelect } from '@/components/common/SearchableSelect';

interface POFormProps {
  mode: 'create' | 'edit' | 'view';
  initialData?: PurchaseOrder;
  availableLocations?: MasterDataLocation[];
}

export function POForm({ mode, initialData, availableLocations = [] }: POFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRSWarning, setShowRSWarning] = useState(false);

  const [formData, setFormData] = useState({
    poNumber: initialData?.poNumber || '',
    poDate: initialData?.poDate || '',
    category: initialData?.category || ('kopi' as Category),
    fileUrl: initialData?.fileUrl || '',
    fileName: initialData?.fileName || '',
    fileSize: initialData?.fileSize || 0,
    herminaLocation: initialData?.herminaLocation || '',
    totalAmount: initialData?.totalAmount?.toString() || '',
  });

  // No longer loading locations since we auto-detect branch names directly

  const handleValidateFile = async (file: File): Promise<{ success: boolean; errorMessage?: string }> => {
    const fileNameLower = file.name.toLowerCase();
    const blacklist = ["kopi", "aren", "syrup", "sirup", "po", "pdf", "invoice", "resi", "dashboard", "file", "upload", "test", "record"];

    const extractBranchName = (text: string): string | null => {
      // Mencari kata "hermina" diikuti oleh kata berikutnya
      const match = text.match(/hermina\s+([a-zA-Z0-9\s]+)/i);
      if (match) {
        const candidateWords = match[1].trim().split(/[\s_\-]+/);
        const filteredWords = candidateWords.filter(
          word => word && !blacklist.includes(word.toLowerCase())
        );
        // Ambil maksimal 2 kata pertama yang bukan blacklist
        const branchWords = filteredWords.slice(0, 2);
        if (branchWords.length > 0) {
          return branchWords.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
        }
      }
      return null;
    };

    // 1. Coba deteksi dari nama file
    const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
    const cleanName = nameWithoutExt.replace(/[_\-\s]+/g, " ");
    let detectedRS = extractBranchName(cleanName);

    // 2. Fallback: baca biner/teks isi file
    if (!detectedRS) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const textContent = new TextDecoder('utf-8', { fatal: false }).decode(arrayBuffer);
        detectedRS = extractBranchName(textContent);
      } catch (err) {
        console.error('Error reading PDF content:', err);
      }
    }

    // Auto-detect category from filename if present (fallback to "kopi")
    let detectedCategory = formData.category;
    if (fileNameLower.includes('aren')) {
      detectedCategory = 'aren';
    } else if (fileNameLower.includes('syrup') || fileNameLower.includes('sirup')) {
      detectedCategory = 'syrup';
    } else if (fileNameLower.includes('kopi')) {
      detectedCategory = 'kopi';
    }

    let matchedLocation: MasterDataLocation | undefined;
    if (detectedRS) {
      const searchKey = detectedRS.toLowerCase();
      matchedLocation = availableLocations.find(
        (loc) => loc.branchName.toLowerCase().includes(searchKey)
      );
    }

    if (matchedLocation) {
      setShowRSWarning(false);
      setFormData(prev => ({
        ...prev,
        herminaLocation: matchedLocation!.branchName,
        category: detectedCategory,
      }));
    } else if (detectedRS) {
      const fallbackName = `RS Hermina ${detectedRS}`;
      const exactFallback = availableLocations.find(
        (loc) => loc.branchName.toLowerCase() === fallbackName.toLowerCase()
      );
      if (exactFallback) {
        setShowRSWarning(false);
        setFormData(prev => ({
          ...prev,
          herminaLocation: exactFallback.branchName,
          category: detectedCategory,
        }));
      } else {
        setShowRSWarning(true);
        setFormData(prev => ({
          ...prev,
          category: detectedCategory,
        }));
      }
    } else {
      setShowRSWarning(true);
      setFormData(prev => ({
        ...prev,
        category: detectedCategory,
      }));
    }

    return { success: true };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate file upload for create mode
    if (mode === 'create' && !formData.fileUrl) {
      setError('Please upload a PO file');
      return;
    }

    // Validate herminaLocation is present
    if (!formData.herminaLocation) {
      setError('Nama RS Hermina wajib diisi.');
      return;
    }

    setIsSubmitting(true);

    try {
      const input = {
        poNumber: formData.poNumber,
        poDate: formData.poDate,
        category: formData.category,
        fileUrl: formData.fileUrl,
        fileName: formData.fileName,
        fileSize: formData.fileSize,
        herminaLocation: formData.herminaLocation,
        totalAmount: formData.totalAmount ? parseFloat(formData.totalAmount) : undefined,
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
    setFormData(prev => ({
      ...prev,
      fileUrl: downloadURL,
      fileName: fileName,
      fileSize: fileSize,
    }));
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
        <label htmlFor="poDate" className="block text-sm font-medium text-gray-700 mb-2">
          PO Date <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          id="poDate"
          value={formData.poDate}
          onChange={(e) => setFormData({ ...formData, poDate: e.target.value })}
          disabled={isReadOnly}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
      </div>

      <div>
        <label htmlFor="herminaLocation" className="block text-sm font-medium text-gray-700 mb-2">
          RS Hermina <span className="text-red-500">*</span>
        </label>
        <SearchableSelect
          id="herminaLocation"
          options={availableLocations.map((loc) => ({
            value: loc.branchName,
            label: loc.branchName,
          }))}
          value={formData.herminaLocation}
          onChange={(val) => setFormData({ ...formData, herminaLocation: val })}
          placeholder="Select RS Hermina Branch"
          disabled={isReadOnly}
          required
        />
        {showRSWarning && !formData.herminaLocation && (
          <p className="text-amber-600 text-xs mt-1">
            ⚠️ Nama RS Hermina tidak terdeteksi otomatis dari file PO. Silakan pilih secara manual.
          </p>
        )}
      </div>

      <div>
        <label htmlFor="totalAmount" className="block text-sm font-medium text-gray-700 mb-2">
          Nominal PO (IDR)
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

      {mode !== 'view' && (
        <FileUpload
          label="PO Document"
          accept=".pdf,application/pdf"
          allowedExtensions={['pdf']}
          maxSizeMB={10}
          storagePath={`purchase-orders/${formData.poNumber || 'temp'}`}
          onUploadComplete={handleFileUpload}
          onUploadError={(error) => setError(error)}
          onValidateFile={handleValidateFile}
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
