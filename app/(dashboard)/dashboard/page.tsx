import { redirect } from 'next/navigation';
import { listPOs } from '@/app/actions/po';
import { listResis } from '@/app/actions/resi';
import { listInvoices } from '@/app/actions/invoice';
import { getCurrentUser } from '@/lib/auth-server';
import { hasFullInvoiceAccess } from '@/lib/authorization';
import { HistoryTable, TransactionHistoryItem } from '@/components/dashboard/HistoryTable';

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch all related transactions data in parallel on the server
  const [posResult, resisResult, invoicesResult] = await Promise.all([
    listPOs(),
    listResis(),
    listInvoices(),
  ]);

  const pos = posResult.success ? posResult.data : [];
  const resis = resisResult.success ? resisResult.data : [];
  const invoices = invoicesResult.success ? invoicesResult.data : [];

  // Map and join transactions data
  const transactions: TransactionHistoryItem[] = pos.map((po) => {
    // Find related Resi by PO ID
    const relatedResi = resis.find((r) => r.poId === po.id);
    
    // Find related Invoice by Resi ID (or PO ID as fallback)
    const relatedInvoice = relatedResi 
      ? invoices.find((i) => i.resiId === relatedResi.id)
      : invoices.find((i) => i.poId === po.id);

    // Determine status of the transaction flow
    let status: TransactionHistoryItem['status'] = 'wait_resi';
    if (relatedResi) {
      if (relatedInvoice) {
        status = relatedInvoice.billingLetterUrl ? 'done' : 'approval_done';
      } else {
        status = 'wait_invoice';
      }
    }

    return {
      id: po.id,
      poNumber: po.poNumber,
      poDate: po.poDate,
      poFileUrl: po.fileUrl,
      poFileName: po.fileName,
      
      resiId: relatedResi?.id,
      resiNumber: relatedResi?.resiNumber,
      resiFileUrl: relatedResi?.receiptUrl,
      
      invoiceId: relatedInvoice?.id,
      invoiceNumber: relatedInvoice?.invoiceNumber,
      deliveryNoteUrl: relatedInvoice?.deliveryNoteUrl,
      receiptUrl: relatedInvoice?.receiptUrl,
      billingLetterUrl: relatedInvoice?.billingLetterUrl,
      
      status,
    };
  });

  const canManage = hasFullInvoiceAccess(user.role);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">History Transaksi</h1>
        <p className="text-gray-600 mt-2">
          Riwayat lengkap dan status dokumen alur transaksi PO, Resi, Invoice, dan Surat Penagihan
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <HistoryTable transactions={transactions} canManage={canManage} />
      </div>
    </div>
  );
}
