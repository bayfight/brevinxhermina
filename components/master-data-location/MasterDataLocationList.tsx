'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { deleteMasterDataLocation } from '@/app/actions/master-data-location';
import { DataTable, Column } from '@/components/common/DataTable';
import { exportToExcel } from '@/lib/excel-export';
import { MasterDataLocation } from '@/types/models';

interface MasterDataLocationListProps {
  locations: MasterDataLocation[];
  canManage: boolean;
}

export function MasterDataLocationList({ locations, canManage }: MasterDataLocationListProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string, locationCode: string) => {
    if (!confirm(`Are you sure you want to delete location ${locationCode}?`)) {
      return;
    }

    setIsDeleting(id);
    const result = await deleteMasterDataLocation(id);

    if (result.success) {
      router.refresh();
    } else {
      alert(`Failed to delete location: ${result.error.message}`);
      setIsDeleting(null);
    }
  };

  const handleExportExcel = () => {
    const exportData = locations.map((location) => ({
      locationCode: location.locationCode,
      province: location.province,
      type: location.type,
      name: location.name,
      status: location.status,
      createdAt: new Date(location.createdAt.seconds * 1000).toLocaleDateString(),
    }));

    exportToExcel(
      exportData,
      [
        { header: 'Location Code', key: 'locationCode', width: 18 },
        { header: 'Province', key: 'province', width: 24 },
        { header: 'Type', key: 'type', width: 14 },
        { header: 'Kabupaten/Kota', key: 'name', width: 28 },
        { header: 'Status', key: 'status', width: 14 },
        { header: 'Created Date', key: 'createdAt', width: 16 },
      ],
      `Master_Data_Lokasi_${new Date().toISOString().split('T')[0]}`
    );
  };

  const columns: Column<MasterDataLocation>[] = [
    {
      key: 'locationCode',
      label: 'Code',
      sortable: true,
    },
    {
      key: 'province',
      label: 'Province',
      sortable: true,
    },
    {
      key: 'type',
      label: 'Type',
      sortable: true,
      render: (location) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
          {location.type}
        </span>
      ),
    },
    {
      key: 'name',
      label: 'Kabupaten/Kota',
      sortable: true,
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (location) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
            location.status === 'active'
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {location.status}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (location) => (
        <div className="flex items-center gap-2">
          <Link
            href={`/master-data-lokasi/${location.id}`}
            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
          >
            View
          </Link>
          {canManage && (
            <>
              <Link
                href={`/master-data-lokasi/${location.id}`}
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 rounded-md hover:bg-green-100 transition-colors"
              >
                Edit
              </Link>
              <button
                onClick={() => handleDelete(location.id, location.locationCode)}
                disabled={isDeleting === location.id}
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 rounded-md hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting === location.id ? 'Deleting...' : 'Delete'}
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={handleExportExcel}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
        >
          Export to Excel
        </button>
      </div>

      <DataTable
        data={locations}
        columns={columns}
        searchPlaceholder="Search by code, province, type, city, or regency..."
        emptyMessage="No master data locations found"
      />
    </div>
  );
}
