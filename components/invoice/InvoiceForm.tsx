'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Invoice, Category, Resi, PurchaseOrder } from '@/types/models';
import { createInvoice, updateInvoice } from '@/app/actions/invoice';
import { FileUpload } from '@/components/common/FileUpload';
import { SearchableSelect } from '@/components/common/SearchableSelect';

function kekata(n: number): string {
  const nomor = ["", "satu", "dua", "tiga", "empat", "lima", "enam", "tujuh", "delapan", "sembilan", "sepuluh", "sebelas"];
  let temp = "";
  if (n < 12) {
    temp = " " + nomor[n];
  } else if (n < 20) {
    temp = kekata(n - 10) + " belas";
  } else if (n < 100) {
    temp = kekata(Math.floor(n / 10)) + " puluh" + kekata(n % 10);
  } else if (n < 200) {
    temp = " seratus" + kekata(n - 100);
  } else if (n < 1000) {
    temp = kekata(Math.floor(n / 100)) + " ratus" + kekata(n % 100);
  } else if (n < 2000) {
    temp = " seribu" + kekata(n - 1000);
  } else if (n < 1000000) {
    temp = kekata(Math.floor(n / 1000)) + " ribu" + kekata(n % 1000);
  } else if (n < 1000000000) {
    temp = kekata(Math.floor(n / 1000000)) + " juta" + kekata(n % 1000000);
  } else if (n < 1000000000000) {
    temp = kekata(Math.floor(n / 1000000000)) + " milyar" + kekata(n % 1000000000);
  } else if (n < 1000000000000000) {
    temp = kekata(Math.floor(n / 1000000000000)) + " trilyun" + kekata(n % 1000000000000);
  }
  return temp;
}

function generateTerbilang(n: number): string {
  if (n === 0) return "Nol Rupiah";
  const hasil = kekata(n).trim();
  return hasil.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()) + " Rupiah";
}

const formatTanggal = (dateStr: string) => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return dateStr;
};

const formatRupiah = (val: number) => {
  const cleanVal = Math.round(val);
  return new Intl.NumberFormat('id-ID').format(cleanVal);
};

interface InvoiceFormProps {
  mode: 'create' | 'edit' | 'view';
  initialData?: Invoice;
  availableResis: Resi[];
  availablePOs: PurchaseOrder[];
  availableLocations?: MasterDataLocation[];
  preselectedResiId?: string;
}

export function InvoiceForm({
  mode,
  initialData,
  availableResis = [],
  availablePOs = [],
  availableLocations = [],
  preselectedResiId,
}: InvoiceFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    invoiceNumber: initialData?.invoiceNumber || '',
    resiId: preselectedResiId || initialData?.resiId || '',
    poId: initialData?.poId || '',
    totalAmount: initialData?.totalAmount?.toString() || '',
    deliveryNoteUrl: initialData?.deliveryNoteUrl || '',
    receiptUrl: initialData?.receiptUrl || '',
  });

  const [showCopySuccess, setShowCopySuccess] = useState(false);

  // Auto-fill PO and total amount when Resi is selected (in create/edit mode)
  useEffect(() => {
    if (formData.resiId && mode !== 'view') {
      const selectedResi = availableResis.find((r) => r.id === formData.resiId);
      if (selectedResi) {
        setFormData((prev) => {
          if (prev.poId !== selectedResi.poId) {
            const selectedPO = availablePOs.find((p) => p.id === selectedResi.poId);
            return {
              ...prev,
              poId: selectedResi.poId,
              totalAmount: selectedPO?.totalAmount ? selectedPO.totalAmount.toString() : prev.totalAmount,
            };
          }
          return prev;
        });
      }
    }
  }, [formData.resiId, availableResis, availablePOs, mode]);

  // Auto-fill total amount when PO is selected
  useEffect(() => {
    if (formData.poId && mode !== 'view') {
      const selectedPO = availablePOs.find((p) => p.id === formData.poId);
      if (selectedPO && selectedPO.totalAmount) {
        setFormData((prev) => ({
          ...prev,
          totalAmount: selectedPO.totalAmount!.toString(),
        }));
      }
    }
  }, [formData.poId, availablePOs, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate file uploads for create mode
    if (mode === 'create') {
      if (!formData.deliveryNoteUrl) {
        setError('Please upload Delivery Note');
        return;
      }
      if (!formData.receiptUrl) {
        setError('Please upload Receipt');
        return;
      }
    }

    if (!formData.resiId) {
      setError('No related Resi reference found. Invoice must be linked to a Resi.');
      return;
    }

    const selectedResi = availableResis.find((r) => r.id === formData.resiId);
    if (!selectedResi) {
      setError('Selected Resi not found.');
      return;
    }

    setIsSubmitting(true);

    try {
      const input = {
        invoiceNumber: formData.invoiceNumber,
        resiId: formData.resiId,
        poId: formData.poId || selectedResi.poId,
        totalAmount: formData.totalAmount ? parseFloat(formData.totalAmount) : undefined,
        deliveryNoteUrl: formData.deliveryNoteUrl,
        receiptUrl: formData.receiptUrl,
      };

      let result;
      if (mode === 'create') {
        result = await createInvoice(input as any);
      } else {
        result = await updateInvoice(initialData!.id, input as any);
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

  const handleDeliveryNoteUpload = (downloadURL: string) => {
    setFormData((prev) => ({ ...prev, deliveryNoteUrl: downloadURL }));
  };

  const handleReceiptUpload = (downloadURL: string) => {
    setFormData((prev) => ({ ...prev, receiptUrl: downloadURL }));
  };

  const isReadOnly = mode === 'view';
  const selectedResi = (availableResis || []).find((r) => r.id === formData.resiId);
  const selectedPO = (availablePOs || []).find((p) => p.id === formData.poId || (selectedResi && p.id === selectedResi.poId));

  const getAmountVal = () => {
    return formData.totalAmount ? parseFloat(formData.totalAmount) : (selectedPO?.totalAmount || 0);
  };

  const getBranchAddress = () => {
    if (!selectedPO) return '';
    const matchedLoc = (availableLocations || []).find((l) => l.branchName === selectedPO.herminaLocation);
    return matchedLoc ? matchedLoc.address : '[Alamat Cabang tidak ditemukan di Master Data Lokasi]';
  };

  const generateInvoiceNumberStr = () => {
    const invoiceNumberRaw = formData.invoiceNumber || '[Nomor Invoice]';
    if (invoiceNumberRaw && !invoiceNumberRaw.includes('/')) {
      const today = new Date();
      const months = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
      const romanMonth = months[today.getMonth()];
      const currentYear = today.getFullYear();
      return `${invoiceNumberRaw}/A-c/PH/BREVIN/${romanMonth}/${currentYear}`;
    }
    return invoiceNumberRaw;
  };

  const generateBillingTemplate = () => {
    if (!selectedPO || !selectedResi) return '';
    const herminaName = selectedPO.herminaLocation || 'Hermina';
    const amountVal = getAmountVal();
    const amountRupiah = formatRupiah(amountVal);
    const amountTerbilang = generateTerbilang(amountVal);
    const poDateFormatted = selectedPO.poDate ? formatTanggal(selectedPO.poDate) : '';
    const invoiceNumberStr = generateInvoiceNumberStr();
    const branchAddress = getBranchAddress();

    return `No: ${invoiceNumberStr}
Perihal : Penagihan

Kepada Yth.
Dandy Hafidz Ferdiansyah +62 812-8911-5757
RSIA HERMINA GROUP (KOKARMINA)
${herminaName}
${branchAddress}

Up: Bagian Keuangan

Dengan Hormat,

Kami informasikan dan kirimkan dokumen asli (Surat jalan, Konfirmasi pesanan asli) yang berfungsi sebagai tagihan (lihat lampiran), Sejumlah Rp. ${amountRupiah}, ${amountTerbilang}

Untuk Piutang Tanggal: ${poDateFormatted}                Rp. ${amountRupiah}
Total:                                              Rp. ${amountRupiah}

Untuk pembayaran transfer atas nama:

                           CV Bintang Rajawali Evolution

         Bank Syariah Indonesia (BSI)               Bank Nasional Indonesia (BNI)

                 7339923587                                 2022252959

Atas perhatian dan kerjasama yang baik, kami ucapkan terimakasih

Hormat Kami,
CV. Bintang Rajawali Evolution


Muhamad Satrio Legowo`;
  };

  const billingTemplate = generateBillingTemplate();

  const handleCopyTemplate = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(billingTemplate);
      setShowCopySuccess(true);
      setTimeout(() => setShowCopySuccess(false), 2000);
    }
  };

  return (
    <>
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
        <SearchableSelect
          id="resiId"
          options={availableResis.map((resi) => ({
            value: resi.id,
            label: resi.resiNumber,
          }))}
          value={formData.resiId}
          onChange={(val) => setFormData({ ...formData, resiId: val })}
          placeholder="Select a Resi"
          disabled={isReadOnly}
          required
        />
      </div>

      <div>
        <label htmlFor="poId" className="block text-sm font-medium text-gray-700 mb-2">
          Related PO <span className="text-red-500">*</span>
        </label>
        <SearchableSelect
          id="poId"
          options={availablePOs.map((po) => ({
            value: po.id,
            label: `${po.poNumber} (${po.fileName})`,
          }))}
          value={formData.poId}
          onChange={(val) => setFormData({ ...formData, poId: val })}
          placeholder="Select a PO"
          disabled={isReadOnly}
          required
        />
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

      {/* Template Penagihan Area */}
      {selectedPO && selectedResi && (
        <div className="border-t pt-6 space-y-6 no-print">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Surat Penagihan Preview & Ekspor
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">Preview lembar dokumen penagihan fisik (A4)</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleCopyTemplate}
                className={`px-4 py-2 text-sm font-semibold rounded-lg shadow-sm transition-all duration-200 ${
                  showCopySuccess 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                }`}
              >
                {showCopySuccess ? '✓ Copied!' : '📋 Copy Text'}
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 active:scale-95 transition-all duration-200"
              >
                🖨️ Print / Save PDF
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Kiri: Textarea / Copyable Text */}
            <div className="space-y-2">
              <label htmlFor="billingTemplate" className="block text-sm font-medium text-gray-700">
                Text Template (For Copy-Paste)
              </label>
              <textarea
                id="billingTemplate"
                value={billingTemplate}
                readOnly
                rows={22}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-xs font-mono text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-inner"
              />
            </div>

            {/* Kanan: A4 Visual Preview */}
            <div className="space-y-2 flex flex-col items-center xl:items-start overflow-hidden">
              <span className="block text-sm font-medium text-gray-700 self-start">
                Visual Document Preview (A4 Page)
              </span>
              <div className="w-full overflow-x-auto flex justify-center xl:justify-start py-2">
                <div 
                  id="billing-preview-page" 
                  className="w-[595px] h-[842px] bg-white border border-gray-300 shadow-2xl relative overflow-hidden text-gray-800 font-sans flex-shrink-0 select-none scale-[0.7] sm:scale-[0.85] md:scale-100 origin-top-left"
                  style={{
                    backgroundImage: "url('/images/invoice-background.png')",
                    backgroundSize: '100% 100%',
                    backgroundRepeat: 'no-repeat',
                  }}
                >
                  {/* Text Content overlay on background */}
                  <div className="absolute left-[70px] right-[70px] top-[180px] bottom-[110px] flex flex-col justify-between text-[11px] leading-relaxed text-black">
                    <div className="space-y-3">
                      {/* Header Details */}
                      <div>
                        <p className="font-mono">No: {generateInvoiceNumberStr()}</p>
                        <p>Perihal : Penagihan</p>
                      </div>

                      {/* Recipient */}
                      <div className="space-y-0.5">
                        <p>Kepada Yth.</p>
                        <p className="font-semibold">Dandy Hafidz Ferdiansyah +62 812-8911-5757</p>
                        <p>RSIA HERMINA GROUP (KOKARMINA)</p>
                        <p>{selectedPO.herminaLocation || 'Hermina'}</p>
                        <p className="max-w-[320px] text-gray-700 leading-tight">{getBranchAddress()}</p>
                      </div>

                      <p className="font-semibold">Up: Bagian Keuangan</p>
                      <p className="mt-3">Dengan Hormat,</p>
                      
                      <p className="text-justify">
                        Kami informasikan dan kirimkan dokumen asli (Surat jalan, Konfirmasi pesanan asli) yang berfungsi sebagai tagihan (lihat lampiran), Sejumlah <span className="font-semibold">Rp. {formatRupiah(getAmountVal())}</span>, <span className="italic">({generateTerbilang(getAmountVal())})</span>
                      </p>

                      {/* Table / Nominal Details */}
                      <div className="mt-4 border-t border-b border-gray-400 py-2 space-y-1">
                        <div className="flex justify-between">
                          <span>Untuk Piutang Tanggal: {selectedPO.poDate ? formatTanggal(selectedPO.poDate) : ''}</span>
                          <span className="font-mono">Rp. {formatRupiah(getAmountVal())}</span>
                        </div>
                        <div className="flex justify-between font-semibold border-t border-dashed border-gray-300 pt-1">
                          <span>Total:</span>
                          <span className="font-mono">Rp. {formatRupiah(getAmountVal())}</span>
                        </div>
                      </div>

                      {/* Bank Info */}
                      <div className="mt-4 bg-gray-50 p-2.5 rounded border border-gray-200 space-y-1 text-[10px]">
                        <p className="font-semibold text-gray-700">Untuk pembayaran transfer atas nama:</p>
                        <p className="font-bold text-center text-blue-900">CV Bintang Rajawali Evolution</p>
                        <div className="grid grid-cols-2 gap-4 text-center mt-1">
                          <div>
                            <p className="text-gray-500 font-semibold">Bank Syariah Indonesia (BSI)</p>
                            <p className="font-mono font-bold text-gray-900">7339923587</p>
                          </div>
                          <div>
                            <p className="text-gray-500 font-semibold">Bank Nasional Indonesia (BNI)</p>
                            <p className="font-mono font-bold text-gray-900">2022252959</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Sign-off */}
                    <div className="self-start text-left w-56 flex flex-col items-start">
                      <p>Hormat Kami,</p>
                      <p className="font-semibold">CV. Bintang Rajawali Evolution</p>
                      <div className="h-10"></div> {/* Space for signature */}
                      <p className="font-semibold underline">Muhamad Satrio Legowo</p>
                    </div>
                  </div>
                </div>
              </div>
              {/* Compensate container height since preview is scaled down */}
              <div className="h-[250px] xl:h-[150px] block" />
            </div>
          </div>
        </div>
      )}

      {/* Print container was moved outside form to prevent display:none inherit issues */}

      {/* File Uploads */}
      {mode !== 'view' && (
        <>
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Document Uploads</h3>

            <div className="space-y-6">
              <FileUpload
                label="Delivery Note (Surat Jalan)"
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
                label="Receipt (Struk)"
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
            {formData.deliveryNoteUrl && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delivery Note (Surat Jalan)
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
                  Receipt (Struk)
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

    {/* Hidden print container with original high-quality print styling (OUTSIDE FORM) */}
    {selectedPO && selectedResi && (
      <div className="hidden print:block print-only font-sans text-black" style={{ fontFamily: 'Arial, sans-serif' }}>
        <div className="absolute left-[70px] right-[70px] top-[180px] bottom-[110px] flex flex-col justify-between text-[11px] leading-relaxed">
          <div className="space-y-4">
            <div>
              <p>No: {generateInvoiceNumberStr()}</p>
              <p>Perihal : Penagihan</p>
            </div>

            <div>
              <p>Kepada Yth.</p>
              <p className="font-semibold">Dandy Hafidz Ferdiansyah +62 812-8911-5757</p>
              <p>RSIA HERMINA GROUP (KOKARMINA)</p>
              <p>{selectedPO.herminaLocation || 'Hermina'}</p>
              <p className="max-w-[320px] text-gray-800 leading-tight">{getBranchAddress()}</p>
            </div>

            <p className="font-semibold">Up: Bagian Keuangan</p>
            <p className="mt-4">Dengan Hormat,</p>
            
            <p className="text-justify">
              Kami informasikan dan kirimkan dokumen asli (Surat jalan, Konfirmasi pesanan asli) yang berfungsi sebagai tagihan (lihat lampiran), Sejumlah <span className="font-semibold">Rp. {formatRupiah(getAmountVal())}</span>, <span className="italic">({generateTerbilang(getAmountVal())})</span>
            </p>

            <div className="mt-6 border-t border-b border-gray-400 py-2 space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span>Untuk Piutang Tanggal: {selectedPO.poDate ? formatTanggal(selectedPO.poDate) : ''}</span>
                <span className="font-mono">Rp. {formatRupiah(getAmountVal())}</span>
              </div>
              <div className="flex justify-between font-semibold border-t border-dashed border-gray-300 pt-1">
                <span>Total:</span>
                <span className="font-mono">Rp. {formatRupiah(getAmountVal())}</span>
              </div>
            </div>

            <div className="mt-6 p-3 rounded border border-gray-200 space-y-1 text-[10px]">
              <p className="font-semibold text-gray-700">Untuk pembayaran transfer atas nama:</p>
              <p className="font-bold text-center text-blue-900">CV Bintang Rajawali Evolution</p>
              <div className="grid grid-cols-2 gap-4 text-center mt-1">
                <div>
                  <p className="text-gray-500 font-semibold">Bank Syariah Indonesia (BSI)</p>
                  <p className="font-mono font-bold text-gray-900">7339923587</p>
                </div>
                <div>
                  <p className="text-gray-500 font-semibold">Bank Nasional Indonesia (BNI)</p>
                  <p className="font-mono font-bold text-gray-900">2022252959</p>
                </div>
              </div>
            </div>
          </div>

          <div className="self-start text-left w-56 flex flex-col items-start">
            <p>Hormat Kami,</p>
            <p className="font-semibold">CV. Bintang Rajawali Evolution</p>
            <div className="h-16"></div>
            <p className="font-semibold underline">Muhamad Satrio Legowo</p>
          </div>
        </div>
      </div>
    )}

    {/* Global CSS injection for printing (OUTSIDE FORM) */}
    <style dangerouslySetInnerHTML={{ __html: `
      @media print {
        /* Sembunyikan elemen non-cetak global */
        .no-print,
        aside,
        header,
        nav,
        form,
        button,
        footer {
          display: none !important;
          height: 0 !important;
          overflow: hidden !important;
        }

        /* Sembunyikan judul halaman "Create/Edit/View Invoice" di page.tsx */
        main > div > div:first-child {
          display: none !important;
          height: 0 !important;
          overflow: hidden !important;
        }

        /* Hilangkan padding, margin, latar belakang, dan bayangan pada halaman */
        html, body {
          background: white !important;
          margin: 0 !important;
          padding: 0 !important;
          width: 210mm !important;
          height: 297mm !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }

        /* Matikan flex layout pada struktur pembungkus halaman terluar agar tidak merusak halaman cetak */
        body > div {
          display: block !important;
          margin: 0 !important;
          padding: 0 !important;
        }

        /* Hilangkan margin/padding dari kontainer main */
        main {
          margin: 0 !important;
          padding: 0 !important;
        }

        /* Tampilkan kontainer print-only absolut di kiri atas halaman */
        .print-only {
          display: block !important;
          position: absolute !important;
          left: 0 !important;
          top: 0 !important;
          width: 210mm !important;
          height: 297mm !important;
          margin: 0 !important;
          padding: 0 !important;
          box-shadow: none !important;
          background-image: url('/images/invoice-background.png') !important;
          background-size: 100% 100% !important;
          background-repeat: no-repeat !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          z-index: 9999 !important;
        }
      }
    ` }} />
  </>
  );
}
