'use server';

import { PurchaseOrder, Result, Category } from '@/types/models';
import { getCurrentUser } from '@/lib/auth-server';
import { hasFullPOAccess } from '@/lib/authorization';
import { db } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import { revalidatePath } from 'next/cache';

const COLLECTION_NAME = 'purchase_orders';

function serializeTimestamp(timestamp: any) {
  if (!timestamp) return null;
  return {
    seconds: timestamp.seconds,
    nanoseconds: timestamp.nanoseconds,
  } as any;
}

function serializePO(id: string, data: FirebaseFirestore.DocumentData): PurchaseOrder {
  return {
    id,
    poNumber: data.poNumber,
    poDate: data.poDate,
    fileUrl: data.fileUrl,
    fileName: data.fileName,
    fileSize: data.fileSize,
    category: data.category,
    uploadedBy: data.uploadedBy,
    uploadedAt: serializeTimestamp(data.uploadedAt),
    createdAt: serializeTimestamp(data.createdAt),
    updatedAt: serializeTimestamp(data.updatedAt),
    herminaLocation: data.herminaLocation,
    totalAmount: data.totalAmount,
    metadata: data.metadata || {},
  };
}

export async function listPOs(): Promise<Result<PurchaseOrder[]>> {
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

    const snapshot = await db
      .collection(COLLECTION_NAME)
      .orderBy('createdAt', 'desc')
      .get();

    const pos = snapshot.docs.map((doc) => serializePO(doc.id, doc.data()));

    return {
      success: true,
      data: pos,
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'DB_OPERATION_FAILED',
        message: 'Failed to fetch purchase orders',
      },
    };
  }
}

export async function getPOById(id: string): Promise<Result<PurchaseOrder>> {
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
          message: 'Purchase order not found',
        },
      };
    }

    return {
      success: true,
      data: serializePO(doc.id, doc.data()!),
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'DB_OPERATION_FAILED',
        message: 'Failed to fetch purchase order',
      },
    };
  }
}

interface CreatePOInput {
  poNumber: string;
  poDate?: string;
  category: Category;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  herminaLocation?: string;
  totalAmount?: number;
  metadata?: Record<string, any>;
}

export async function createPO(input: CreatePOInput): Promise<Result<PurchaseOrder>> {
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
    if (!hasFullPOAccess(user.role)) {
      return {
        success: false,
        error: {
          code: 'AUTHZ_FORBIDDEN',
          message: 'You do not have permission to create purchase orders',
        },
      };
    }

    // Validate required fields
    if (!input.poNumber || !input.fileUrl) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_REQUIRED_FIELD',
          message: 'PO number and file are required',
        },
      };
    }

    // Check for duplicate PO number
    const duplicateCheck = await db
      .collection(COLLECTION_NAME)
      .where('poNumber', '==', input.poNumber)
      .limit(1)
      .get();

    if (!duplicateCheck.empty) {
      return {
        success: false,
        error: {
          code: 'DB_DUPLICATE',
          message: 'A purchase order with this PO number already exists',
        },
      };
    }

    const now = Timestamp.now();
    
    const docRef = await db.collection(COLLECTION_NAME).add({
      poNumber: input.poNumber,
      poDate: input.poDate || '',
      fileUrl: input.fileUrl,
      fileName: input.fileName,
      fileSize: input.fileSize,
      category: input.category || 'kopi',
      uploadedBy: user.uid,
      uploadedAt: now,
      createdAt: now,
      updatedAt: now,
      herminaLocation: input.herminaLocation || '',
      totalAmount: input.totalAmount || 0,
      metadata: input.metadata || {},
    });

    revalidatePath('/po');

    const doc = await docRef.get();

    return {
      success: true,
      data: serializePO(doc.id, doc.data()!),
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'DB_OPERATION_FAILED',
        message: 'Failed to create purchase order',
      },
    };
  }
}

interface UpdatePOInput {
  poNumber?: string;
  poDate?: string;
  category?: Category;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  herminaLocation?: string;
  totalAmount?: number;
  metadata?: Record<string, any>;
}

export async function updatePO(
  id: string,
  input: UpdatePOInput
): Promise<Result<PurchaseOrder>> {
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
    if (!hasFullPOAccess(user.role)) {
      return {
        success: false,
        error: {
          code: 'AUTHZ_FORBIDDEN',
          message: 'You do not have permission to update purchase orders',
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
          message: 'Purchase order not found',
        },
      };
    }

    // Check for duplicate PO number if updating
    if (input.poNumber && input.poNumber !== existing.data()!.poNumber) {
      const duplicateCheck = await db
        .collection(COLLECTION_NAME)
        .where('poNumber', '==', input.poNumber)
        .limit(1)
        .get();

      if (!duplicateCheck.empty) {
        return {
          success: false,
          error: {
            code: 'DB_DUPLICATE',
            message: 'A purchase order with this PO number already exists',
          },
        };
      }
    }

    const updateData: Record<string, any> = {
      updatedAt: Timestamp.now(),
    };

    if (input.poNumber !== undefined) updateData.poNumber = input.poNumber;
    if (input.poDate !== undefined) updateData.poDate = input.poDate;
    if (input.category !== undefined) updateData.category = input.category;
    if (input.fileUrl !== undefined) updateData.fileUrl = input.fileUrl;
    if (input.fileName !== undefined) updateData.fileName = input.fileName;
    if (input.fileSize !== undefined) updateData.fileSize = input.fileSize;
    if (input.herminaLocation !== undefined) updateData.herminaLocation = input.herminaLocation;
    if (input.totalAmount !== undefined) updateData.totalAmount = input.totalAmount;
    if (input.metadata !== undefined) updateData.metadata = input.metadata;

    await docRef.update(updateData);

    revalidatePath('/po');
    revalidatePath(`/po/${id}`);

    const doc = await docRef.get();

    return {
      success: true,
      data: serializePO(doc.id, doc.data()!),
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'DB_OPERATION_FAILED',
        message: 'Failed to update purchase order',
      },
    };
  }
}

export async function deletePO(id: string): Promise<Result<void>> {
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
    if (!hasFullPOAccess(user.role)) {
      return {
        success: false,
        error: {
          code: 'AUTHZ_FORBIDDEN',
          message: 'You do not have permission to delete purchase orders',
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
          message: 'Purchase order not found',
        },
      };
    }

    await docRef.delete();

    revalidatePath('/po');

    return {
      success: true,
      data: undefined,
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'DB_OPERATION_FAILED',
        message: 'Failed to delete purchase order',
      },
    };
  }
}
