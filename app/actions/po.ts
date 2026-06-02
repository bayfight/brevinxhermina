'use server';

import { PurchaseOrder, Result, Category } from '@/types/models';
import { getCurrentUser } from '@/lib/auth-server';
import { hasFullPOAccess } from '@/lib/authorization';

// Mock data store (in-memory for MVP)
let mockPOs: PurchaseOrder[] = [
  {
    id: '1',
    poNumber: 'PO-2024-001',
    fileUrl: '#',
    fileName: 'po-001.pdf',
    fileSize: 1024000,
    category: 'kopi',
    uploadedBy: 'user1',
    uploadedAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any,
    createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any,
    updatedAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any,
    metadata: { supplier: 'Coffee Supplier A' },
  },
  {
    id: '2',
    poNumber: 'PO-2024-002',
    fileUrl: '#',
    fileName: 'po-002.pdf',
    fileSize: 2048000,
    category: 'syrup',
    uploadedBy: 'user2',
    uploadedAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any,
    createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any,
    updatedAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any,
    metadata: { supplier: 'Syrup Supplier B' },
  },
];

let nextId = 3;

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

    // Return all POs (category filtering can be added later)
    return {
      success: true,
      data: mockPOs,
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

    const po = mockPOs.find((p) => p.id === id);
    
    if (!po) {
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
      data: po,
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
  category: Category;
  fileUrl: string;
  fileName: string;
  fileSize: number;
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
    if (!input.poNumber || !input.category || !input.fileUrl) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_REQUIRED_FIELD',
          message: 'PO number, category, and file are required',
        },
      };
    }

    // Check for duplicate PO number
    const existingPO = mockPOs.find((p) => p.poNumber === input.poNumber);
    if (existingPO) {
      return {
        success: false,
        error: {
          code: 'DB_DUPLICATE',
          message: 'A purchase order with this PO number already exists',
        },
      };
    }

    const now = { seconds: Date.now() / 1000, nanoseconds: 0 } as any;
    
    const newPO: PurchaseOrder = {
      id: String(nextId++),
      poNumber: input.poNumber,
      fileUrl: input.fileUrl,
      fileName: input.fileName,
      fileSize: input.fileSize,
      category: input.category,
      uploadedBy: user.uid,
      uploadedAt: now,
      createdAt: now,
      updatedAt: now,
      metadata: input.metadata || {},
    };

    mockPOs.push(newPO);

    return {
      success: true,
      data: newPO,
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
  category?: Category;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
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

    const poIndex = mockPOs.findIndex((p) => p.id === id);
    
    if (poIndex === -1) {
      return {
        success: false,
        error: {
          code: 'DB_NOT_FOUND',
          message: 'Purchase order not found',
        },
      };
    }

    // Check for duplicate PO number if updating
    if (input.poNumber && input.poNumber !== mockPOs[poIndex].poNumber) {
      const existingPO = mockPOs.find((p) => p.poNumber === input.poNumber);
      if (existingPO) {
        return {
          success: false,
          error: {
            code: 'DB_DUPLICATE',
            message: 'A purchase order with this PO number already exists',
          },
        };
      }
    }

    const updatedPO: PurchaseOrder = {
      ...mockPOs[poIndex],
      ...(input.poNumber && { poNumber: input.poNumber }),
      ...(input.category && { category: input.category }),
      ...(input.fileUrl && { fileUrl: input.fileUrl }),
      ...(input.fileName && { fileName: input.fileName }),
      ...(input.fileSize && { fileSize: input.fileSize }),
      ...(input.metadata && { metadata: input.metadata }),
      updatedAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any,
    };

    mockPOs[poIndex] = updatedPO;

    return {
      success: true,
      data: updatedPO,
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

    const poIndex = mockPOs.findIndex((p) => p.id === id);
    
    if (poIndex === -1) {
      return {
        success: false,
        error: {
          code: 'DB_NOT_FOUND',
          message: 'Purchase order not found',
        },
      };
    }

    mockPOs.splice(poIndex, 1);

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
