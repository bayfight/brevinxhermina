import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth-server';
import {
  hasFullMasterDataAccess,
  hasMasterDataAccess,
} from '@/lib/authorization';
import { getMasterDataItemById } from '@/app/actions/master-data';
import { MasterDataItemForm } from '@/components/master-data/MasterDataItemForm';

interface MasterDataItemDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function MasterDataItemDetailPage({
  params,
}: MasterDataItemDetailPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  if (!hasMasterDataAccess(user.role)) {
    redirect('/dashboard');
  }

  const { id } = await params;
  const result = await getMasterDataItemById(id);

  if (!result.success) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Master Data Item Not Found</h1>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{result.error.message}</p>
        </div>
      </div>
    );
  }

  const canManage = hasFullMasterDataAccess(user.role);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          {canManage ? 'Edit' : 'View'} Master Data Item
        </h1>
        <p className="text-gray-600 mt-2">
          Item Code: {result.data.itemCode}
        </p>
      </div>

      <MasterDataItemForm mode={canManage ? 'edit' : 'view'} initialData={result.data} />
    </div>
  );
}
