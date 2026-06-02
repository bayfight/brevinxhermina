import { StatCard } from '@/components/dashboard/StatCard';

export default async function DashboardPage() {
  // Mock data for MVP - will be replaced with Firestore queries later
  const incomingPOsCount = 12;
  const resiInTransitCount = 8;
  const invoicesSentCount = 5;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Overview of your purchase orders, shipments, and invoices
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Incoming POs"
          count={incomingPOsCount}
          icon={<span className="text-2xl">📦</span>}
          link="/po"
          description="Purchase orders awaiting processing"
        />

        <StatCard
          title="Resi in Transit"
          count={resiInTransitCount}
          icon={<span className="text-2xl">🚚</span>}
          link="/resi"
          description="Shipments currently in transit"
        />

        <StatCard
          title="Invoices Sent"
          count={invoicesSentCount}
          icon={<span className="text-2xl">📄</span>}
          link="/invoice"
          description="Invoices sent to customers"
        />
      </div>

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> Dashboard metrics are currently using mock data. 
          Firestore queries will be integrated in a future task.
        </p>
      </div>
    </div>
  );
}
