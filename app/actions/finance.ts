'use server';

import { FinanceRecord, Result, Category } from '@/types/models';
import { getCurrentUser } from '@/lib/auth-server';
import { hasFinanceAccess, getAllowedCategories } from '@/lib/authorization';

// Mock data store (in-memory for MVP)
let mockFinanceRecords: FinanceRecord[] = [
  {
    id: '1',
    invoiceId: '1',
    category: 'kopi',
    paymentStatus: 'paid',
    amount: 5000000,
    paidAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any,
    createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any,
    updatedAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any,
  },
  {
    id: '2',
    invoiceId: '2',
    category: 'syrup',
    paymentStatus: 'unpaid',
    amount: 3000000,
    createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any,
    updatedAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any,
  },
  {
    id: '3',
    invoiceId: '1',
    category: 'aren',
    paymentStatus: 'paid',
    amount: 2500000,
    paidAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any,
    createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any,
    updatedAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any,
  },
];

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

    // Filter records by allowed categories
    const filteredRecords = mockFinanceRecords.filter((record) =>
      allowedCategories.includes(record.category)
    );

    return {
      success: true,
      data: filteredRecords,
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

    const record = mockFinanceRecords.find((r) => r.id === id);
    
    if (!record) {
      return {
        success: false,
        error: {
          code: 'DB_NOT_FOUND',
          message: 'Finance record not found',
        },
      };
    }

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
