import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth-server';
import { hasFullResiAccess } from '@/lib/authorization';
import { listPOs } from '@/app/actions/po';
import { ResiForm } from '@/components/resi/ResiForm';

export default async function NewResiPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  if (!hasFullResiAccess(user.role)) {
    redirect('/resi');
  }

  // Fetch available POs for dropdown
  const posResult = await listPOs();
  const availablePOs = posResult.success ? posResult.data : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Create New Resi</h1>
        <p className="text-gray-600 mt-1">Add a new shipping receipt to the system</p>
      </div>

      <ResiForm mode="create" availablePOs={availablePOs} />
    </div>
  );
}
