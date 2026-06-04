import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth-server';
import {
  hasFullMasterDataAccess,
  hasMasterDataAccess,
} from '@/lib/authorization';
import { listMasterDataItems } from '@/app/actions/master-data';
import { MasterDataItemList } from '@/components/master-data/MasterDataItemList';

export default async function MasterDataPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  if (!hasMasterDataAccess(user.role)) {
    redirect('/dashboard');
  }

  const result = await listMasterDataItems();

  if (!result.success) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-3xl font-bold text-gray-900">Master Data Item</h1>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Failed to load master data items: {result.error.message}</p>
        </div>
      </div>
    );
  }

  const canManage = hasFullMasterDataAccess(user.role);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Master Data Item</h1>
          <p className="text-gray-600 mt-2">Manage the item catalog sold by the business</p>
        </div>
        {canManage && (
          <Link
            href="/master-data/new"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto text-center"
          >
            + Create Item
          </Link>
        )}
      </div>

      <MasterDataItemList items={result.data} canManage={canManage} />
    </div>
  );
}
