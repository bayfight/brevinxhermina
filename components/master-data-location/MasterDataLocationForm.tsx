'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ItemStatus, LocationType, MasterDataLocation } from '@/types/models';
import {
  createMasterDataLocation,
  updateMasterDataLocation,
} from '@/app/actions/master-data-location';

interface MasterDataLocationFormProps {
  mode: 'create' | 'edit' | 'view';
  initialData?: MasterDataLocation;
}

export function MasterDataLocationForm({ mode, initialData }: MasterDataLocationFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    locationCode: initialData?.locationCode || '',
    province: initialData?.province || '',
    type: initialData?.type || ('kabupaten' as LocationType),
    name: initialData?.name || '',
    status: initialData?.status || ('active' as ItemStatus),
  });

  const isReadOnly = mode === 'view';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const result =
        mode === 'create'
          ? await createMasterDataLocation(formData)
          : await updateMasterDataLocation(initialData!.id, formData);

      if (result.success) {
        router.push('/master-data-lokasi');
        router.refresh();
      } else {
        setError(result.error.message);
        setIsSubmitting(false);
      }
    } catch (err) {
      setError('An unexpected error occurred');
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="locationCode" className="block text-sm font-medium text-gray-700 mb-2">
            Location Code <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="locationCode"
            value={formData.locationCode}
            onChange={(e) => setFormData({ ...formData, locationCode: e.target.value })}
            disabled={isReadOnly}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder="e.g., 3273"
          />
        </div>

        <div>
          <label htmlFor="province" className="block text-sm font-medium text-gray-700 mb-2">
            Province <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="province"
            value={formData.province}
            onChange={(e) => setFormData({ ...formData, province: e.target.value })}
            disabled={isReadOnly}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder="e.g., Jawa Barat"
          />
        </div>

        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
            Type <span className="text-red-500">*</span>
          </label>
          <select
            id="type"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as LocationType })}
            disabled={isReadOnly}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="kabupaten">Kabupaten</option>
            <option value="kota">Kota</option>
          </select>
        </div>

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Kabupaten/Kota Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            disabled={isReadOnly}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder="e.g., Bandung"
          />
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
            Status <span className="text-red-500">*</span>
          </label>
          <select
            id="status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as ItemStatus })}
            disabled={isReadOnly}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {!isReadOnly && (
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Location' : 'Update Location'}
          </button>
        )}
        <button
          type="button"
          onClick={() => router.push('/master-data-lokasi')}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          {isReadOnly ? 'Back' : 'Cancel'}
        </button>
      </div>
    </form>
  );
}
