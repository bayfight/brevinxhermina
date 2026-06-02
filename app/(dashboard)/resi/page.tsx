import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth-server';
import { hasResiAccess, hasFullResiAccess } from '@/lib/authorization';
import { listResis } from '@/app/actions/resi';
import { ResiList } from '@/components/resi/ResiList';

export default async function ResiPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  if (!hasResiAccess(user.role)) {
    redirect('/dashboard');
  }

  const canManage = hasFullResiAccess(user.role);

  // Await searchParams in Next.js 15
  const { category } = await searchParams;

  // Fetch resis with optional category filter
  const result = await listResis(
    category ? { category: category as any } : undefined
  );

  const resis = result.success ? result.data : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Resi Management</h1>
          <p className="text-gray-600 mt-1">Manage shipping receipts and track deliveries</p>
        </div>
        {canManage && (
          <Link
            href="/resi/new"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create New Resi
          </Link>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <ResiList resis={resis} canManage={canManage} currentCategory={category} />
      </div>
    </div>
  );
}
