'use server';

import { revalidatePath } from 'next/cache';
import { Timestamp } from 'firebase-admin/firestore';
import { db } from '@/lib/firebase-admin';
import { getCurrentUser } from '@/lib/auth-server';
import { hasFullMasterDataAccess, hasMasterDataAccess } from '@/lib/authorization';
import { Category, ItemStatus, MasterDataItem, Result } from '@/types/models';

const COLLECTION_NAME = 'master_data_items';

interface CreateMasterDataItemInput {
  itemCode: string;
  name: string;
  category: Category;
  unit: string;
  price: number;
  status: ItemStatus;
  description?: string;
}

interface UpdateMasterDataItemInput {
  itemCode?: string;
  name?: string;
  category?: Category;
  unit?: string;
  price?: number;
  status?: ItemStatus;
  description?: string;
}

function serializeTimestamp(timestamp: Timestamp) {
  return {
    seconds: timestamp.seconds,
    nanoseconds: timestamp.nanoseconds,
  } as any;
}

function serializeItem(id: string, data: FirebaseFirestore.DocumentData): MasterDataItem {
  return {
    id,
    itemCode: data.itemCode,
    name: data.name,
    category: data.category,
    unit: data.unit,
    price: data.price,
    status: data.status,
    description: data.description || '',
    createdBy: data.createdBy,
    createdAt: serializeTimestamp(data.createdAt),
    updatedAt: serializeTimestamp(data.updatedAt),
  };
}

function normalizeItemCode(itemCode: string) {
  return itemCode.trim().toUpperCase();
}

function validateInput(input: CreateMasterDataItemInput | UpdateMasterDataItemInput) {
  if ('itemCode' in input && input.itemCode !== undefined && !input.itemCode.trim()) {
    return 'Item code is required';
  }

  if ('name' in input && input.name !== undefined && !input.name.trim()) {
    return 'Item name is required';
  }

  if ('unit' in input && input.unit !== undefined && !input.unit.trim()) {
    return 'Unit is required';
  }

  if ('price' in input && input.price !== undefined && (!Number.isFinite(input.price) || input.price < 0)) {
    return 'Price must be a valid non-negative number';
  }

  return null;
}

async function itemCodeExists(itemCode: string, excludeId?: string) {
  const snapshot = await db
    .collection(COLLECTION_NAME)
    .where('itemCode', '==', normalizeItemCode(itemCode))
    .limit(1)
    .get();

  if (snapshot.empty) return false;

  if (excludeId && snapshot.docs[0].id === excludeId) {
    return false;
  }

  return true;
}

export async function listMasterDataItems(): Promise<Result<MasterDataItem[]>> {
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
          message: 'You do not have permission to view master data items',
        },
      };
    }

    const snapshot = await db
      .collection(COLLECTION_NAME)
      .orderBy('createdAt', 'desc')
      .get();

    return {
      success: true,
      data: snapshot.docs.map((doc) => serializeItem(doc.id, doc.data())),
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'DB_OPERATION_FAILED',
        message: 'Failed to fetch master data items',
      },
    };
  }
}

export async function getMasterDataItemById(id: string): Promise<Result<MasterDataItem>> {
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
          message: 'You do not have permission to view master data items',
        },
      };
    }

    const doc = await db.collection(COLLECTION_NAME).doc(id).get();

    if (!doc.exists) {
      return {
        success: false,
        error: {
          code: 'DB_NOT_FOUND',
          message: 'Master data item not found',
        },
      };
    }

    return {
      success: true,
      data: serializeItem(doc.id, doc.data()!),
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'DB_OPERATION_FAILED',
        message: 'Failed to fetch master data item',
      },
    };
  }
}

export async function createMasterDataItem(
  input: CreateMasterDataItemInput
): Promise<Result<MasterDataItem>> {
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
          message: 'You do not have permission to create master data items',
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

    if (await itemCodeExists(input.itemCode)) {
      return {
        success: false,
        error: {
          code: 'DB_DUPLICATE',
          message: 'An item with this item code already exists',
        },
      };
    }

    const now = Timestamp.now();
    const docRef = await db.collection(COLLECTION_NAME).add({
      itemCode: normalizeItemCode(input.itemCode),
      name: input.name.trim(),
      category: input.category,
      unit: input.unit.trim(),
      price: Number(input.price),
      status: input.status,
      description: input.description?.trim() || '',
      createdBy: user.uid,
      createdAt: now,
      updatedAt: now,
    });

    revalidatePath('/master-data');

    const doc = await docRef.get();
    return {
      success: true,
      data: serializeItem(doc.id, doc.data()!),
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'DB_OPERATION_FAILED',
        message: 'Failed to create master data item',
      },
    };
  }
}

export async function updateMasterDataItem(
  id: string,
  input: UpdateMasterDataItemInput
): Promise<Result<MasterDataItem>> {
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
          message: 'You do not have permission to update master data items',
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
          message: 'Master data item not found',
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

    if (input.itemCode && await itemCodeExists(input.itemCode, id)) {
      return {
        success: false,
        error: {
          code: 'DB_DUPLICATE',
          message: 'An item with this item code already exists',
        },
      };
    }

    const updateData: Record<string, unknown> = {
      updatedAt: Timestamp.now(),
    };

    if (input.itemCode !== undefined) updateData.itemCode = normalizeItemCode(input.itemCode);
    if (input.name !== undefined) updateData.name = input.name.trim();
    if (input.category !== undefined) updateData.category = input.category;
    if (input.unit !== undefined) updateData.unit = input.unit.trim();
    if (input.price !== undefined) updateData.price = Number(input.price);
    if (input.status !== undefined) updateData.status = input.status;
    if (input.description !== undefined) updateData.description = input.description.trim();

    await docRef.update(updateData);

    revalidatePath('/master-data');
    revalidatePath(`/master-data/${id}`);

    const doc = await docRef.get();
    return {
      success: true,
      data: serializeItem(doc.id, doc.data()!),
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'DB_OPERATION_FAILED',
        message: 'Failed to update master data item',
      },
    };
  }
}

export async function deleteMasterDataItem(id: string): Promise<Result<void>> {
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
          message: 'You do not have permission to delete master data items',
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
          message: 'Master data item not found',
        },
      };
    }

    await docRef.delete();

    revalidatePath('/master-data');

    return {
      success: true,
      data: undefined,
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'DB_OPERATION_FAILED',
        message: 'Failed to delete master data item',
      },
    };
  }
}
