import { redirect } from 'next/navigation';
import Link from 'next/link';
import { listMasterDataLocations } from '@/app/actions/master-data-location';
import { MasterDataLocationList } from '@/components/master-data-location/MasterDataLocationList';
import { getCurrentUser } from '@/lib/auth-server';
import {
  hasFullMasterDataAccess,
  hasMasterDataAccess,
} from '@/lib/authorization';

export default async function MasterDataLokasiPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  if (!hasMasterDataAccess(user.role)) {
    redirect('/dashboard');
  }

  const result = await listMasterDataLocations();

  if (!result.success) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-3xl font-bold text-gray-900">Master Data Lokasi</h1>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Failed to load master data locations: {result.error.message}</p>
        </div>
      </div>
    );
  }

  const canManage = hasFullMasterDataAccess(user.role);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Master Data Lokasi</h1>
          <p className="text-gray-600 mt-2">Manage Hermina branch locations, PIC, and contact details</p>
        </div>
        {canManage && (
          <Link
            href="/master-data-lokasi/new"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto text-center animate-pulse-subtle"
          >
            + Create Location
          </Link>
        )}
      </div>

      <MasterDataLocationList locations={result.data} canManage={canManage} />
    </div>
  );
}
