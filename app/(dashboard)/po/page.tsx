import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth-server';
import { hasFullPOAccess } from '@/lib/authorization';
import { listPOs } from '@/app/actions/po';
import { POList } from '@/components/po/POList';

export default async function POPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  const result = await listPOs();

  if (!result.success) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Purchase Orders</h1>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Failed to load purchase orders: {result.error.message}</p>
        </div>
      </div>
    );
  }

  const canManagePO = hasFullPOAccess(user.role);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Purchase Orders</h1>
        {canManagePO && (
          <Link
            href="/po/new"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Create PO
          </Link>
        )}
      </div>

      <POList pos={result.data} canManage={canManagePO} />
    </div>
  );
}
