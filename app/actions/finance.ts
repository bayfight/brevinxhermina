'use server';

import { FinanceRecord, Result, Category } from '@/types/models';
import { getCurrentUser } from '@/lib/auth-server';
import { hasFinanceAccess, getAllowedCategories } from '@/lib/authorization';
import { db } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import { revalidatePath } from 'next/cache';

const COLLECTION_NAME = 'finance_records';

function serializeTimestamp(timestamp: any) {
  if (!timestamp) return null;
  return {
    seconds: timestamp.seconds,
    nanoseconds: timestamp.nanoseconds,
  } as any;
}

function serializeFinanceRecord(id: string, data: FirebaseFirestore.DocumentData): FinanceRecord {
  return {
    id,
    invoiceId: data.invoiceId,
    category: data.category,
    paymentStatus: data.paymentStatus,
    amount: data.amount,
    paidAt: serializeTimestamp(data.paidAt),
    createdAt: serializeTimestamp(data.createdAt),
    updatedAt: serializeTimestamp(data.updatedAt),
  };
}

export async function listFinanceRecords(): Promise<Result<FinanceRecord[]>> {
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

    // Check if user has finance access
    if (!hasFinanceAccess(user.role)) {
      return {
        success: false,
        error: {
          code: 'AUTHZ_FORBIDDEN',
          message: 'You do not have permission to view finance records',
        },
      };
    }

    // Get allowed categories for the user
    const allowedCategories = getAllowedCategories(user.role);

    if (!allowedCategories || allowedCategories.length === 0) {
      return {
        success: true,
        data: [],
      };
    }

    // Fetch records by allowed categories from Firestore
    const snapshot = await db
      .collection(COLLECTION_NAME)
      .where('category', 'in', allowedCategories)
      .orderBy('createdAt', 'desc')
      .get();

    const records = snapshot.docs.map((doc) => serializeFinanceRecord(doc.id, doc.data()));

    return {
      success: true,
      data: records,
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'DB_OPERATION_FAILED',
        message: 'Failed to fetch finance records',
      },
    };
  }
}

export async function getFinanceRecordById(id: string): Promise<Result<FinanceRecord>> {
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

    // Check if user has finance access
    if (!hasFinanceAccess(user.role)) {
      return {
        success: false,
        error: {
          code: 'AUTHZ_FORBIDDEN',
          message: 'You do not have permission to view finance records',
        },
      };
    }

    const doc = await db.collection(COLLECTION_NAME).doc(id).get();
    
    if (!doc.exists) {
      return {
        success: false,
        error: {
          code: 'DB_NOT_FOUND',
          message: 'Finance record not found',
        },
      };
    }

    const record = serializeFinanceRecord(doc.id, doc.data()!);

    // Check if user has access to this category
    const allowedCategories = getAllowedCategories(user.role);
    if (!allowedCategories.includes(record.category)) {
      return {
        success: false,
        error: {
          code: 'AUTHZ_CATEGORY_RESTRICTED',
          message: 'You do not have access to this category',
        },
      };
    }

    return {
      success: true,
      data: record,
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'DB_OPERATION_FAILED',
        message: 'Failed to fetch finance record',
      },
    };
  }
}
