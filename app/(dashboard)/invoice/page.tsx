import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth-server';
import { hasInvoiceAccess, hasFullInvoiceAccess } from '@/lib/authorization';
import { listInvoices } from '@/app/actions/invoice';
import { InvoiceList } from '@/components/invoice/InvoiceList';

export default async function InvoicePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  if (!hasInvoiceAccess(user.role)) {
    redirect('/dashboard');
  }

  const canManage = hasFullInvoiceAccess(user.role);

  // Fetch invoices
  const result = await listInvoices();
  const invoices = result.success ? result.data : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Invoice Management</h1>
          <p className="text-gray-600 mt-1">Manage invoices and billing documents</p>
        </div>
        {canManage && (
          <Link
            href="/invoice/new"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto text-center"
          >
            Create New Invoice
          </Link>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <InvoiceList invoices={invoices} canManage={canManage} />
      </div>
    </div>
  );
}
