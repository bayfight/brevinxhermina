import { redirect } from 'next/navigation';
import { MasterDataLocationForm } from '@/components/master-data-location/MasterDataLocationForm';
import { getCurrentUser } from '@/lib/auth-server';
import { hasFullMasterDataAccess } from '@/lib/authorization';

export default async function NewMasterDataLokasiPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  if (!hasFullMasterDataAccess(user.role)) {
    redirect('/master-data-lokasi');
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Create Master Data Lokasi</h1>
        <p className="text-gray-600 mt-2">Add a new Indonesian kabupaten or kota</p>
      </div>

      <MasterDataLocationForm mode="create" />
    </div>
  );
}
