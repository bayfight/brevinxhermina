'use server';

import { revalidatePath } from 'next/cache';
import { Timestamp } from 'firebase-admin/firestore';
import { db } from '@/lib/firebase-admin';
import { getCurrentUser } from '@/lib/auth-server';
import { hasFullMasterDataAccess, hasMasterDataAccess } from '@/lib/authorization';
import {
  ItemStatus,
  LocationType,
  MasterDataLocation,
  Result,
} from '@/types/models';

const COLLECTION_NAME = 'master_data_locations';

interface CreateMasterDataLocationInput {
  locationCode: string;
  province: string;
  type: LocationType;
  name: string;
  status: ItemStatus;
}

interface UpdateMasterDataLocationInput {
  locationCode?: string;
  province?: string;
  type?: LocationType;
  name?: string;
  status?: ItemStatus;
}

function serializeTimestamp(timestamp: Timestamp) {
  return {
    seconds: timestamp.seconds,
    nanoseconds: timestamp.nanoseconds,
  } as any;
}

function serializeLocation(id: string, data: FirebaseFirestore.DocumentData): MasterDataLocation {
  return {
    id,
    locationCode: data.locationCode,
    province: data.province,
    type: data.type,
    name: data.name,
    status: data.status,
    createdBy: data.createdBy,
    createdAt: serializeTimestamp(data.createdAt),
    updatedAt: serializeTimestamp(data.updatedAt),
  };
}

function normalizeLocationCode(locationCode: string) {
  return locationCode.trim().toUpperCase();
}

function validateInput(input: CreateMasterDataLocationInput | UpdateMasterDataLocationInput) {
  if ('locationCode' in input && input.locationCode !== undefined && !input.locationCode.trim()) {
    return 'Location code is required';
  }

  if ('province' in input && input.province !== undefined && !input.province.trim()) {
    return 'Province is required';
  }

  if ('name' in input && input.name !== undefined && !input.name.trim()) {
    return 'Kabupaten/Kota name is required';
  }

  return null;
}

async function locationCodeExists(locationCode: string, excludeId?: string) {
  const snapshot = await db
    .collection(COLLECTION_NAME)
    .where('locationCode', '==', normalizeLocationCode(locationCode))
    .limit(1)
    .get();

  if (snapshot.empty) return false;

  if (excludeId && snapshot.docs[0].id === excludeId) {
    return false;
  }

  return true;
}

export async function listMasterDataLocations(): Promise<Result<MasterDataLocation[]>> {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return {
        success: false,
        error: {
          code: 'AUTH_REQUIRED',
          message: 'Authentication required',
        },
      };
    }

    if (!hasMasterDataAccess(user.role)) {
      return {
        success: false,
        error: {
          code: 'AUTHZ_FORBIDDEN',
          message: 'You do not have permission to view master data locations',
        },
      };
    }

    const snapshot = await db
      .collection(COLLECTION_NAME)
      .orderBy('province', 'asc')
      .orderBy('name', 'asc')
      .get();

    return {
      success: true,
      data: snapshot.docs.map((doc) => serializeLocation(doc.id, doc.data())),
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'DB_OPERATION_FAILED',
        message: 'Failed to fetch master data locations',
      },
    };
  }
}

export async function getMasterDataLocationById(id: string): Promise<Result<MasterDataLocation>> {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return {
        success: false,
        error: {
          code: 'AUTH_REQUIRED',
          message: 'Authentication required',
        },
      };
    }

    if (!hasMasterDataAccess(user.role)) {
      return {
        success: false,
        error: {
          code: 'AUTHZ_FORBIDDEN',
          message: 'You do not have permission to view master data locations',
        },
      };
    }

    const doc = await db.collection(COLLECTION_NAME).doc(id).get();

    if (!doc.exists) {
      return {
        success: false,
        error: {
          code: 'DB_NOT_FOUND',
          message: 'Master data location not found',
        },
      };
    }

    return {
      success: true,
      data: serializeLocation(doc.id, doc.data()!),
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'DB_OPERATION_FAILED',
        message: 'Failed to fetch master data location',
      },
    };
  }
}

export async function createMasterDataLocation(
  input: CreateMasterDataLocationInput
): Promise<Result<MasterDataLocation>> {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return {
        success: false,
        error: {
          code: 'AUTH_REQUIRED',
          message: 'Authentication required',
        },
      };
    }

    if (!hasFullMasterDataAccess(user.role)) {
      return {
        success: false,
        error: {
          code: 'AUTHZ_FORBIDDEN',
          message: 'You do not have permission to create master data locations',
        },
      };
    }

    const validationError = validateInput(input);
    if (validationError) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_REQUIRED_FIELD',
          message: validationError,
        },
      };
    }

    if (await locationCodeExists(input.locationCode)) {
      return {
        success: false,
        error: {
          code: 'DB_DUPLICATE',
          message: 'A location with this code already exists',
        },
      };
    }

    const now = Timestamp.now();
    const docRef = await db.collection(COLLECTION_NAME).add({
      locationCode: normalizeLocationCode(input.locationCode),
      province: input.province.trim(),
      type: input.type,
      name: input.name.trim(),
      status: input.status,
      createdBy: user.uid,
      createdAt: now,
      updatedAt: now,
    });

    revalidatePath('/master-data-lokasi');

    const doc = await docRef.get();
    return {
      success: true,
      data: serializeLocation(doc.id, doc.data()!),
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'DB_OPERATION_FAILED',
        message: 'Failed to create master data location',
      },
    };
  }
}

export async function updateMasterDataLocation(
  id: string,
  input: UpdateMasterDataLocationInput
): Promise<Result<MasterDataLocation>> {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return {
        success: false,
        error: {
          code: 'AUTH_REQUIRED',
          message: 'Authentication required',
        },
      };
    }

    if (!hasFullMasterDataAccess(user.role)) {
      return {
        success: false,
        error: {
          code: 'AUTHZ_FORBIDDEN',
          message: 'You do not have permission to update master data locations',
        },
      };
    }

    const docRef = db.collection(COLLECTION_NAME).doc(id);
    const existing = await docRef.get();

    if (!existing.exists) {
      return {
        success: false,
        error: {
          code: 'DB_NOT_FOUND',
          message: 'Master data location not found',
        },
      };
    }

    const validationError = validateInput(input);
    if (validationError) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_REQUIRED_FIELD',
          message: validationError,
        },
      };
    }

    if (input.locationCode && await locationCodeExists(input.locationCode, id)) {
      return {
        success: false,
        error: {
          code: 'DB_DUPLICATE',
          message: 'A location with this code already exists',
        },
      };
    }

    const updateData: Record<string, unknown> = {
      updatedAt: Timestamp.now(),
    };

    if (input.locationCode !== undefined) updateData.locationCode = normalizeLocationCode(input.locationCode);
    if (input.province !== undefined) updateData.province = input.province.trim();
    if (input.type !== undefined) updateData.type = input.type;
    if (input.name !== undefined) updateData.name = input.name.trim();
    if (input.status !== undefined) updateData.status = input.status;

    await docRef.update(updateData);

    revalidatePath('/master-data-lokasi');
    revalidatePath(`/master-data-lokasi/${id}`);

    const doc = await docRef.get();
    return {
      success: true,
      data: serializeLocation(doc.id, doc.data()!),
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'DB_OPERATION_FAILED',
        message: 'Failed to update master data location',
      },
    };
  }
}

export async function deleteMasterDataLocation(id: string): Promise<Result<void>> {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return {
        success: false,
        error: {
          code: 'AUTH_REQUIRED',
          message: 'Authentication required',
        },
      };
    }

    if (!hasFullMasterDataAccess(user.role)) {
      return {
        success: false,
        error: {
          code: 'AUTHZ_FORBIDDEN',
          message: 'You do not have permission to delete master data locations',
        },
      };
    }

    const docRef = db.collection(COLLECTION_NAME).doc(id);
    const existing = await docRef.get();

    if (!existing.exists) {
      return {
        success: false,
        error: {
          code: 'DB_NOT_FOUND',
          message: 'Master data location not found',
        },
      };
    }

    await docRef.delete();

    revalidatePath('/master-data-lokasi');

    return {
      success: true,
      data: undefined,
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'DB_OPERATION_FAILED',
        message: 'Failed to delete master data location',
      },
    };
  }
}
