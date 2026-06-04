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
  branchName: string;
  address: string;
  picName: string;
  picPhone: string;
  status: ItemStatus;
}

interface UpdateMasterDataLocationInput {
  branchName?: string;
  address?: string;
  picName?: string;
  picPhone?: string;
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
    branchName: data.branchName,
    address: data.address,
    picName: data.picName,
    picPhone: data.picPhone,
    status: data.status,
    createdBy: data.createdBy,
    createdAt: serializeTimestamp(data.createdAt),
    updatedAt: serializeTimestamp(data.updatedAt),
  };
}

function validateInput(input: CreateMasterDataLocationInput | UpdateMasterDataLocationInput) {
  if ('branchName' in input && input.branchName !== undefined && !input.branchName.trim()) {
    return 'Cabang Hermina is required';
  }

  if ('address' in input && input.address !== undefined && !input.address.trim()) {
    return 'Alamat is required';
  }

  if ('picName' in input && input.picName !== undefined && !input.picName.trim()) {
    return 'Nama PIC is required';
  }

  if ('picPhone' in input && input.picPhone !== undefined && !input.picPhone.trim()) {
    return 'No. HP is required';
  }

  return null;
}

async function branchNameExists(branchName: string, excludeId?: string) {
  const snapshot = await db
    .collection(COLLECTION_NAME)
    .where('branchName', '==', branchName.trim())
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
      .orderBy('branchName', 'asc')
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

    if (await branchNameExists(input.branchName)) {
      return {
        success: false,
        error: {
          code: 'DB_DUPLICATE',
          message: 'A location with this branch name already exists',
        },
      };
    }

    const now = Timestamp.now();
    const docRef = await db.collection(COLLECTION_NAME).add({
      branchName: input.branchName.trim(),
      address: input.address.trim(),
      picName: input.picName.trim(),
      picPhone: input.picPhone.trim(),
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

    if (input.branchName && await branchNameExists(input.branchName, id)) {
      return {
        success: false,
        error: {
          code: 'DB_DUPLICATE',
          message: 'A location with this branch name already exists',
        },
      };
    }

    const updateData: Record<string, unknown> = {
      updatedAt: Timestamp.now(),
    };

    if (input.branchName !== undefined) updateData.branchName = input.branchName.trim();
    if (input.address !== undefined) updateData.address = input.address.trim();
    if (input.picName !== undefined) updateData.picName = input.picName.trim();
    if (input.picPhone !== undefined) updateData.picPhone = input.picPhone.trim();
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
