/**
 * Example usage of StatCard component
 * This file demonstrates how to use the StatCard component with different configurations
 */

import { StatCard } from './StatCard';

// Example 1: Basic stat card with icon
export function DashboardStatsExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatCard
        title="Incoming POs"
        count={24}
        icon={
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        }
        link="/po"
        description="Active purchase orders"
      />

      <StatCard
        title="Resi in Transit"
        count={12}
        icon={
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"
            />
          </svg>
        }
        link="/resi"
        description="Shipments being delivered"
      />

      <StatCard
        title="Invoices Sent"
        count={8}
        icon={
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        }
        link="/invoice"
        description="Pending payment"
      />
    </div>
  );
}

// Example 2: Stat card with trend indicator
export function StatCardWithTrendExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <StatCard
        title="Total Revenue"
        count="$45,231"
        trend={{ value: 12.5, isPositive: true }}
        description="Compared to last month"
      />

      <StatCard
        title="Pending Payments"
        count="$8,420"
        trend={{ value: 5.2, isPositive: false }}
        description="Compared to last month"
      />
    </div>
  );
}

// Example 3: Simple stat card without link
export function SimpleStatCardExample() {
  return (
    <StatCard
      title="Total Users"
      count={156}
      description="Registered users"
    />
  );
}
