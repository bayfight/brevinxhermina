import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth-server';
import { hasFullMasterDataAccess } from '@/lib/authorization';
import { MasterDataItemForm } from '@/components/master-data/MasterDataItemForm';

export default async function NewMasterDataItemPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  if (!hasFullMasterDataAccess(user.role)) {
    redirect('/master-data');
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Create Master Data Item</h1>
        <p className="text-gray-600 mt-2">Add a new item to the catalog</p>
      </div>

      <MasterDataItemForm mode="create" />
    </div>
  );
}
