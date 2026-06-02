import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth-server';
import { hasFinanceAccess, getAllowedCategories } from '@/lib/authorization';
import { listFinanceRecords } from '@/app/actions/finance';
import { FinanceTable } from '@/components/finance/FinanceTable';

export default async function FinancePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  if (!hasFinanceAccess(user.role)) {
    redirect('/dashboard');
  }

  // Fetch finance records (already filtered by user's allowed categories)
  const result = await listFinanceRecords();
  const records = result.success ? result.data : [];

  // Get allowed categories for display
  const allowedCategories = getAllowedCategories(user.role);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Finance Records</h1>
        <p className="text-gray-600 mt-1">
          View financial records and payment status
          {allowedCategories.length < 3 && (
            <span className="ml-2 text-sm">
              (Filtered: {allowedCategories.join(', ')})
            </span>
          )}
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-800 text-sm">
          <strong>Note:</strong> This is a read-only view. Finance records are automatically generated from invoices.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <FinanceTable records={records} />
      </div>
    </div>
  );
}
