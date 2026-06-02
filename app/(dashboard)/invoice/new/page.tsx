import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth-server';
import { hasFullInvoiceAccess } from '@/lib/authorization';
import { listResis } from '@/app/actions/resi';
import { InvoiceForm } from '@/components/invoice/InvoiceForm';

export default async function NewInvoicePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  if (!hasFullInvoiceAccess(user.role)) {
    redirect('/invoice');
  }

  // Fetch available Resis for dropdown
  const resisResult = await listResis();
  const availableResis = resisResult.success ? resisResult.data : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Create New Invoice</h1>
        <p className="text-gray-600 mt-1">Add a new invoice to the system</p>
      </div>

      <InvoiceForm mode="create" availableResis={availableResis} />
    </div>
  );
}
