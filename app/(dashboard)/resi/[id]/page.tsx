import { redirect, notFound } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth-server';
import { hasResiAccess, hasFullResiAccess } from '@/lib/authorization';
import { getResiById } from '@/app/actions/resi';
import { listPOs } from '@/app/actions/po';
import { ResiForm } from '@/components/resi/ResiForm';

export default async function ResiDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  if (!hasResiAccess(user.role)) {
    redirect('/dashboard');
  }

  const canManage = hasFullResiAccess(user.role);

  // Await params in Next.js 15
  const { id } = await params;

  // Fetch resi data
  const result = await getResiById(id);

  if (!result.success) {
    notFound();
  }

  const resi = result.data;

  // Fetch available POs for dropdown
  const posResult = await listPOs();
  const availablePOs = posResult.success ? posResult.data : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          {canManage ? 'Edit' : 'View'} Resi
        </h1>
        <p className="text-gray-600 mt-1">
          {canManage ? 'Update resi information' : 'View resi details'}
        </p>
      </div>

      <ResiForm
        mode={canManage ? 'edit' : 'view'}
        initialData={resi}
        availablePOs={availablePOs}
      />
    </div>
  );
}
