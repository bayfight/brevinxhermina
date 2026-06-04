'use server';

import { Resi, Result, Category, ResiStatus } from '@/types/models';
import { getCurrentUser } from '@/lib/auth-server';
import { hasFullResiAccess } from '@/lib/authorization';
import { db } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import { revalidatePath } from 'next/cache';

const COLLECTION_NAME = 'resis';

function serializeTimestamp(timestamp: any) {
  if (!timestamp) return null;
  return {
    seconds: timestamp.seconds,
    nanoseconds: timestamp.nanoseconds,
  } as any;
}

function serializeResi(id: string, data: FirebaseFirestore.DocumentData): Resi {
  return {
    id,
    resiNumber: data.resiNumber,
    poId: data.poId,
    category: data.category,
    senderPhone: data.senderPhone,
    receiverPhone: data.receiverPhone,
    receiptUrl: data.receiptUrl,
    receiptFileName: data.receiptFileName,
    status: data.status,
    uploadedBy: data.uploadedBy,
    createdAt: serializeTimestamp(data.createdAt),
    updatedAt: serializeTimestamp(data.updatedAt),
  };
}

interface ResiFilters {
  category?: Category;
}

export async function listResis(filters?: ResiFilters): Promise<Result<Resi[]>> {
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

    let queryRef: FirebaseFirestore.Query = db.collection(COLLECTION_NAME);

    // Apply category filter if provided and not empty
    if (filters?.category) {
      queryRef = queryRef.where('category', '==', filters.category);
    }

    const snapshot = await queryRef.orderBy('createdAt', 'desc').get();
    const resis = snapshot.docs.map((doc) => serializeResi(doc.id, doc.data()));

    return {
      success: true,
      data: resis,
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'DB_OPERATION_FAILED',
        message: 'Failed to fetch resi records',
      },
    };
  }
}

export async function getResiById(id: string): Promise<Result<Resi>> {
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

    const doc = await db.collection(COLLECTION_NAME).doc(id).get();
    
    if (!doc.exists) {
      return {
        success: false,
        error: {
          code: 'DB_NOT_FOUND',
          message: 'Resi not found',
        },
      };
    }

    return {
      success: true,
      data: serializeResi(doc.id, doc.data()!),
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'DB_OPERATION_FAILED',
        message: 'Failed to fetch resi',
      },
    };
  }
}

interface CreateResiInput {
  resiNumber: string;
  poId: string;
  category?: Category;
  senderPhone: string;
  receiverPhone: string;
  status?: ResiStatus;
  receiptUrl?: string;
  receiptFileName?: string;
}

export async function createResi(input: CreateResiInput): Promise<Result<Resi>> {
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

    // Check authorization
    if (!hasFullResiAccess(user.role)) {
      return {
        success: false,
        error: {
          code: 'AUTHZ_FORBIDDEN',
          message: 'You do not have permission to create resi records',
        },
      };
    }

    // Validate required fields
    if (!input.resiNumber || !input.poId || !input.senderPhone || !input.receiverPhone) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_REQUIRED_FIELD',
          message: 'Resi number, PO, sender phone, and receiver phone are required',
        },
      };
    }

    // Check for duplicate resi number
    const duplicateCheck = await db
      .collection(COLLECTION_NAME)
      .where('resiNumber', '==', input.resiNumber)
      .limit(1)
      .get();

    if (!duplicateCheck.empty) {
      return {
        success: false,
        error: {
          code: 'DB_DUPLICATE',
          message: 'A resi with this number already exists',
        },
      };
    }

    const now = Timestamp.now();
    
    const docRef = await db.collection(COLLECTION_NAME).add({
      resiNumber: input.resiNumber,
      poId: input.poId,
      category: input.category || 'kopi',
      senderPhone: input.senderPhone,
      receiverPhone: input.receiverPhone,
      receiptUrl: input.receiptUrl || '',
      receiptFileName: input.receiptFileName || '',
      status: input.status || 'in_transit',
      uploadedBy: user.uid,
      createdAt: now,
      updatedAt: now,
    });

    revalidatePath('/resi');

    const doc = await docRef.get();

    return {
      success: true,
      data: serializeResi(doc.id, doc.data()!),
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'DB_OPERATION_FAILED',
        message: 'Failed to create resi',
      },
    };
  }
}

interface UpdateResiInput {
  resiNumber?: string;
  poId?: string;
  category?: Category;
  senderPhone?: string;
  receiverPhone?: string;
  status?: ResiStatus;
  receiptUrl?: string;
  receiptFileName?: string;
}

export async function updateResi(
  id: string,
  input: UpdateResiInput
): Promise<Result<Resi>> {
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

    // Check authorization
    if (!hasFullResiAccess(user.role)) {
      return {
        success: false,
        error: {
          code: 'AUTHZ_FORBIDDEN',
          message: 'You do not have permission to update resi records',
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
          message: 'Resi not found',
        },
      };
    }

    // Check for duplicate resi number if updating
    if (input.resiNumber && input.resiNumber !== existing.data()!.resiNumber) {
      const duplicateCheck = await db
        .collection(COLLECTION_NAME)
        .where('resiNumber', '==', input.resiNumber)
        .limit(1)
        .get();

      if (!duplicateCheck.empty) {
        return {
          success: false,
          error: {
            code: 'DB_DUPLICATE',
            message: 'A resi with this number already exists',
          },
        };
      }
    }

    const updateData: Record<string, any> = {
      updatedAt: Timestamp.now(),
    };

    if (input.resiNumber !== undefined) updateData.resiNumber = input.resiNumber;
    if (input.poId !== undefined) updateData.poId = input.poId;
    if (input.category !== undefined) updateData.category = input.category;
    if (input.senderPhone !== undefined) updateData.senderPhone = input.senderPhone;
    if (input.receiverPhone !== undefined) updateData.receiverPhone = input.receiverPhone;
    if (input.status !== undefined) updateData.status = input.status;
    if (input.receiptUrl !== undefined) updateData.receiptUrl = input.receiptUrl;
    if (input.receiptFileName !== undefined) updateData.receiptFileName = input.receiptFileName;

    await docRef.update(updateData);

    revalidatePath('/resi');
    revalidatePath(`/resi/${id}`);

    const doc = await docRef.get();

    return {
      success: true,
      data: serializeResi(doc.id, doc.data()!),
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'DB_OPERATION_FAILED',
        message: 'Failed to update resi',
      },
    };
  }
}

export async function deleteResi(id: string): Promise<Result<void>> {
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

    // Check authorization
    if (!hasFullResiAccess(user.role)) {
      return {
        success: false,
        error: {
          code: 'AUTHZ_FORBIDDEN',
          message: 'You do not have permission to delete resi records',
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
          message: 'Resi not found',
        },
      };
    }

    await docRef.delete();

    revalidatePath('/resi');

    return {
      success: true,
      data: undefined,
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'DB_OPERATION_FAILED',
        message: 'Failed to delete resi',
      },
    };
  }
}
