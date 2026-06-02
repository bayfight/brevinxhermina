import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth-server';
import { hasFullPOAccess } from '@/lib/authorization';
import { POForm } from '@/components/po/POForm';

export default async function NewPOPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  if (!hasFullPOAccess(user.role)) {
    redirect('/po');
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Create Purchase Order</h1>
        <p className="text-gray-600 mt-2">Add a new purchase order to the system</p>
      </div>

      <POForm mode="create" />
    </div>
  );
}
