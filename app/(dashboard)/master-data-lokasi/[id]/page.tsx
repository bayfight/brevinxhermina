import { redirect } from 'next/navigation';
import { getMasterDataLocationById } from '@/app/actions/master-data-location';
import { MasterDataLocationForm } from '@/components/master-data-location/MasterDataLocationForm';
import { getCurrentUser } from '@/lib/auth-server';
import {
  hasFullMasterDataAccess,
  hasMasterDataAccess,
} from '@/lib/authorization';

interface MasterDataLokasiDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function MasterDataLokasiDetailPage({
  params,
}: MasterDataLokasiDetailPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  if (!hasMasterDataAccess(user.role)) {
    redirect('/dashboard');
  }

  const { id } = await params;
  const result = await getMasterDataLocationById(id);

  if (!result.success) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Master Data Lokasi Not Found</h1>
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
          {canManage ? 'Edit' : 'View'} Master Data Lokasi
        </h1>
        <p className="text-gray-600 mt-2">
          Location Code: {result.data.locationCode}
        </p>
      </div>

      <MasterDataLocationForm mode={canManage ? 'edit' : 'view'} initialData={result.data} />
    </div>
  );
}
