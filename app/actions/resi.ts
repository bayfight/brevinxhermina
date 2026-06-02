'use server';

import { Resi, Result, Category, ResiStatus } from '@/types/models';
import { getCurrentUser } from '@/lib/auth-server';
import { hasFullResiAccess, canAccessCategory } from '@/lib/authorization';

// Mock data store (in-memory for MVP)
let mockResis: Resi[] = [
  {
    id: '1',
    resiNumber: 'RESI-2024-001',
    poId: '1',
    category: 'kopi',
    senderPhone: '+6281234567890',
    receiverPhone: '+6289876543210',
    receiptUrl: '#',
    receiptFileName: 'receipt-001.pdf',
    status: 'in_transit',
    uploadedBy: 'user1',
    createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any,
    updatedAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any,
  },
  {
    id: '2',
    resiNumber: 'RESI-2024-002',
    poId: '2',
    category: 'syrup',
    senderPhone: '+6281111111111',
    receiverPhone: '+6282222222222',
    receiptUrl: '#',
    receiptFileName: 'receipt-002.pdf',
    status: 'delivered',
    uploadedBy: 'user2',
    createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any,
    updatedAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any,
  },
];

let nextId = 3;

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

    let filteredResis = mockResis;

    // Apply category filter if provided
    if (filters?.category) {
      filteredResis = filteredResis.filter((r) => r.category === filters.category);
    }

    return {
      success: true,
      data: filteredResis,
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

    const resi = mockResis.find((r) => r.id === id);
    
    if (!resi) {
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
      data: resi,
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
  category: Category;
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

    // Check category access
    if (!canAccessCategory(user.role, input.category)) {
      return {
        success: false,
        error: {
          code: 'AUTHZ_CATEGORY_RESTRICTED',
          message: 'You do not have access to this category',
        },
      };
    }

    // Validate required fields
    if (!input.resiNumber || !input.poId || !input.category || !input.senderPhone || !input.receiverPhone) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_REQUIRED_FIELD',
          message: 'All fields are required',
        },
      };
    }

    // Check for duplicate resi number
    const existingResi = mockResis.find((r) => r.resiNumber === input.resiNumber);
    if (existingResi) {
      return {
        success: false,
        error: {
          code: 'DB_DUPLICATE',
          message: 'A resi with this number already exists',
        },
      };
    }

    const now = { seconds: Date.now() / 1000, nanoseconds: 0 } as any;
    
    const newResi: Resi = {
      id: String(nextId++),
      resiNumber: input.resiNumber,
      poId: input.poId,
      category: input.category,
      senderPhone: input.senderPhone,
      receiverPhone: input.receiverPhone,
      receiptUrl: input.receiptUrl || '',
      receiptFileName: input.receiptFileName || '',
      status: input.status || 'in_transit',
      uploadedBy: user.uid,
      createdAt: now,
      updatedAt: now,
    };

    mockResis.push(newResi);

    return {
      success: true,
      data: newResi,
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

    const resiIndex = mockResis.findIndex((r) => r.id === id);
    
    if (resiIndex === -1) {
      return {
        success: false,
        error: {
          code: 'DB_NOT_FOUND',
          message: 'Resi not found',
        },
      };
    }

    const existingResi = mockResis[resiIndex];

    // Check category access for existing resi
    if (!canAccessCategory(user.role, existingResi.category)) {
      return {
        success: false,
        error: {
          code: 'AUTHZ_CATEGORY_RESTRICTED',
          message: 'You do not have access to this category',
        },
      };
    }

    // Check category access for new category if updating
    if (input.category && !canAccessCategory(user.role, input.category)) {
      return {
        success: false,
        error: {
          code: 'AUTHZ_CATEGORY_RESTRICTED',
          message: 'You do not have access to the new category',
        },
      };
    }

    // Check for duplicate resi number if updating
    if (input.resiNumber && input.resiNumber !== existingResi.resiNumber) {
      const duplicateResi = mockResis.find((r) => r.resiNumber === input.resiNumber);
      if (duplicateResi) {
        return {
          success: false,
          error: {
            code: 'DB_DUPLICATE',
            message: 'A resi with this number already exists',
          },
        };
      }
    }

    const updatedResi: Resi = {
      ...existingResi,
      ...(input.resiNumber && { resiNumber: input.resiNumber }),
      ...(input.poId && { poId: input.poId }),
      ...(input.category && { category: input.category }),
      ...(input.senderPhone && { senderPhone: input.senderPhone }),
      ...(input.receiverPhone && { receiverPhone: input.receiverPhone }),
      ...(input.status && { status: input.status }),
      ...(input.receiptUrl && { receiptUrl: input.receiptUrl }),
      ...(input.receiptFileName && { receiptFileName: input.receiptFileName }),
      updatedAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any,
    };

    mockResis[resiIndex] = updatedResi;

    return {
      success: true,
      data: updatedResi,
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

    const resiIndex = mockResis.findIndex((r) => r.id === id);
    
    if (resiIndex === -1) {
      return {
        success: false,
        error: {
          code: 'DB_NOT_FOUND',
          message: 'Resi not found',
        },
      };
    }

    const resi = mockResis[resiIndex];

    // Check category access
    if (!canAccessCategory(user.role, resi.category)) {
      return {
        success: false,
        error: {
          code: 'AUTHZ_CATEGORY_RESTRICTED',
          message: 'You do not have access to this category',
        },
      };
    }

    mockResis.splice(resiIndex, 1);

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
