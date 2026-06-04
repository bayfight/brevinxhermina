import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth-server';
import { hasFullInvoiceAccess } from '@/lib/authorization';
import { listResis } from '@/app/actions/resi';
import { listPOs } from '@/app/actions/po';
import { listMasterDataLocations } from '@/app/actions/master-data-location';
import { InvoiceForm } from '@/components/invoice/InvoiceForm';

interface PageProps {
  searchParams: Promise<{ resiId?: string }>;
}

export default async function NewInvoicePage({ searchParams }: PageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  if (!hasFullInvoiceAccess(user.role)) {
    redirect('/invoice');
  }

  const resolvedSearchParams = await searchParams;
  const resiId = resolvedSearchParams.resiId;

  // Fetch available Resis, POs, and Locations for lookup
  const [resisResult, posResult, locationsResult] = await Promise.all([
    listResis(),
    listPOs(),
    listMasterDataLocations(),
  ]);

  const availableResis = resisResult.success ? resisResult.data : [];
  const availablePOs = posResult.success ? posResult.data : [];
  const availableLocations = locationsResult.success ? locationsResult.data : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Create New Invoice</h1>
        <p className="text-gray-600 mt-1">Add a new invoice to the system</p>
      </div>

      <InvoiceForm
        mode="create"
        availableResis={availableResis}
        availablePOs={availablePOs}
        availableLocations={availableLocations}
        preselectedResiId={resiId}
      />
    </div>
  );
}
