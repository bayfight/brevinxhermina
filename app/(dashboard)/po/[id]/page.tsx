import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth-server';
import { hasFullPOAccess } from '@/lib/authorization';
import { getPOById } from '@/app/actions/po';
import { POForm } from '@/components/po/POForm';

interface PODetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function PODetailPage({ params }: PODetailPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  const { id } = await params;
  const result = await getPOById(id);

  if (!result.success) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Purchase Order Not Found</h1>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{result.error.message}</p>
        </div>
      </div>
    );
  }

  const canManage = hasFullPOAccess(user.role);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          {canManage ? 'Edit' : 'View'} Purchase Order
        </h1>
        <p className="text-gray-600 mt-2">PO Number: {result.data.poNumber}</p>
      </div>

      <POForm mode={canManage ? 'edit' : 'view'} initialData={result.data} />
    </div>
  );
}
