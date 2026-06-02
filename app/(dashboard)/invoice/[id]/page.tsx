import { redirect, notFound } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth-server';
import { hasInvoiceAccess, hasFullInvoiceAccess } from '@/lib/authorization';
import { getInvoiceById } from '@/app/actions/invoice';
import { listResis } from '@/app/actions/resi';
import { InvoiceForm } from '@/components/invoice/InvoiceForm';

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  if (!hasInvoiceAccess(user.role)) {
    redirect('/dashboard');
  }

  const canManage = hasFullInvoiceAccess(user.role);

  // Await params in Next.js 15
  const { id } = await params;

  // Fetch invoice data
  const result = await getInvoiceById(id);

  if (!result.success) {
    notFound();
  }

  const invoice = result.data;

  // Fetch available Resis for dropdown
  const resisResult = await listResis();
  const availableResis = resisResult.success ? resisResult.data : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          {canManage ? 'Edit' : 'View'} Invoice
        </h1>
        <p className="text-gray-600 mt-1">
          {canManage ? 'Update invoice information' : 'View invoice details'}
        </p>
      </div>

      <InvoiceForm
        mode={canManage ? 'edit' : 'view'}
        initialData={invoice}
        availableResis={availableResis}
      />
    </div>
  );
}
