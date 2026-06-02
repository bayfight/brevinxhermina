'use server';

import { Invoice, Result, Category } from '@/types/models';
import { getCurrentUser } from '@/lib/auth-server';
import { hasFullInvoiceAccess, hasReadInvoiceAccess } from '@/lib/authorization';

// Mock data store (in-memory for MVP)
let mockInvoices: Invoice[] = [
  {
    id: '1',
    invoiceNumber: 'INV-2024-001',
    resiId: '1',
    poId: '1',
    category: 'kopi',
    invoiceTemplateUrl: '#',
    deliveryNoteUrl: '#',
    poAttachmentUrl: '#',
    receiptUrl: '#',
    resiNumber: 'RESI-2024-001',
    totalAmount: 5000000,
    createdBy: 'user1',
    createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any,
    updatedAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any,
  },
  {
    id: '2',
    invoiceNumber: 'INV-2024-002',
    resiId: '2',
    poId: '2',
    category: 'syrup',
    invoiceTemplateUrl: '#',
    deliveryNoteUrl: '#',
    poAttachmentUrl: '#',
    receiptUrl: '#',
    resiNumber: 'RESI-2024-002',
    totalAmount: 3000000,
    createdBy: 'user1',
    createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any,
    updatedAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any,
  },
];

let nextId = 3;

export async function listInvoices(): Promise<Result<Invoice[]>> {
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

    // Check if user has invoice access
    if (!hasReadInvoiceAccess(user.role)) {
      return {
        success: false,
        error: {
          code: 'AUTHZ_FORBIDDEN',
          message: 'You do not have permission to view invoices',
        },
      };
    }

    return {
      success: true,
      data: mockInvoices,
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'DB_OPERATION_FAILED',
        message: 'Failed to fetch invoices',
      },
    };
  }
}

export async function getInvoiceById(id: string): Promise<Result<Invoice>> {
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

    // Check if user has invoice access
    if (!hasReadInvoiceAccess(user.role)) {
      return {
        success: false,
        error: {
          code: 'AUTHZ_FORBIDDEN',
          message: 'You do not have permission to view invoices',
        },
      };
    }

    const invoice = mockInvoices.find((inv) => inv.id === id);
    
    if (!invoice) {
      return {
        success: false,
        error: {
          code: 'DB_NOT_FOUND',
          message: 'Invoice not found',
        },
      };
    }

    return {
      success: true,
      data: invoice,
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'DB_OPERATION_FAILED',
        message: 'Failed to fetch invoice',
      },
    };
  }
}

interface CreateInvoiceInput {
  invoiceNumber: string;
  resiId: string;
  category: Category;
  totalAmount?: number;
  invoiceTemplateUrl: string;
  deliveryNoteUrl: string;
  receiptUrl: string;
}

export async function createInvoice(input: CreateInvoiceInput): Promise<Result<Invoice>> {
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

    // Check authorization - only Super Admin can create invoices
    if (!hasFullInvoiceAccess(user.role)) {
      return {
        success: false,
        error: {
          code: 'AUTHZ_FORBIDDEN',
          message: 'Only Super Admin can create invoices',
        },
      };
    }

    // Validate required fields
    if (!input.invoiceNumber || !input.resiId || !input.category || !input.invoiceTemplateUrl || !input.deliveryNoteUrl || !input.receiptUrl) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_REQUIRED_FIELD',
          message: 'All fields including file uploads are required',
        },
      };
    }

    // Check for duplicate invoice number
    const existingInvoice = mockInvoices.find((inv) => inv.invoiceNumber === input.invoiceNumber);
    if (existingInvoice) {
      return {
        success: false,
        error: {
          code: 'DB_DUPLICATE',
          message: 'An invoice with this number already exists',
        },
      };
    }

    const now = { seconds: Date.now() / 1000, nanoseconds: 0 } as any;
    
    // In a real implementation, we would fetch the Resi and PO data here
    // For MVP, we'll use mock data
    const newInvoice: Invoice = {
      id: String(nextId++),
      invoiceNumber: input.invoiceNumber,
      resiId: input.resiId,
      poId: '1', // Mock - would be fetched from Resi
      category: input.category,
      invoiceTemplateUrl: input.invoiceTemplateUrl,
      deliveryNoteUrl: input.deliveryNoteUrl,
      poAttachmentUrl: '#', // Mock - would be copied from PO
      receiptUrl: input.receiptUrl,
      resiNumber: 'RESI-MOCK', // Mock - would be fetched from Resi
      totalAmount: input.totalAmount,
      createdBy: user.uid,
      createdAt: now,
      updatedAt: now,
    };

    mockInvoices.push(newInvoice);

    return {
      success: true,
      data: newInvoice,
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'DB_OPERATION_FAILED',
        message: 'Failed to create invoice',
      },
    };
  }
}

interface UpdateInvoiceInput {
  invoiceNumber?: string;
  resiId?: string;
  category?: Category;
  totalAmount?: number;
  invoiceTemplateUrl?: string;
  deliveryNoteUrl?: string;
  receiptUrl?: string;
}

export async function updateInvoice(
  id: string,
  input: UpdateInvoiceInput
): Promise<Result<Invoice>> {
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

    // Check authorization - only Super Admin can update invoices
    if (!hasFullInvoiceAccess(user.role)) {
      return {
        success: false,
        error: {
          code: 'AUTHZ_FORBIDDEN',
          message: 'Only Super Admin can update invoices',
        },
      };
    }

    const invoiceIndex = mockInvoices.findIndex((inv) => inv.id === id);
    
    if (invoiceIndex === -1) {
      return {
        success: false,
        error: {
          code: 'DB_NOT_FOUND',
          message: 'Invoice not found',
        },
      };
    }

    // Check for duplicate invoice number if updating
    if (input.invoiceNumber && input.invoiceNumber !== mockInvoices[invoiceIndex].invoiceNumber) {
      const existingInvoice = mockInvoices.find((inv) => inv.invoiceNumber === input.invoiceNumber);
      if (existingInvoice) {
        return {
          success: false,
          error: {
            code: 'DB_DUPLICATE',
            message: 'An invoice with this number already exists',
          },
        };
      }
    }

    const updatedInvoice: Invoice = {
      ...mockInvoices[invoiceIndex],
      ...(input.invoiceNumber && { invoiceNumber: input.invoiceNumber }),
      ...(input.resiId && { resiId: input.resiId }),
      ...(input.category && { category: input.category }),
      ...(input.totalAmount !== undefined && { totalAmount: input.totalAmount }),
      ...(input.invoiceTemplateUrl && { invoiceTemplateUrl: input.invoiceTemplateUrl }),
      ...(input.deliveryNoteUrl && { deliveryNoteUrl: input.deliveryNoteUrl }),
      ...(input.receiptUrl && { receiptUrl: input.receiptUrl }),
      updatedAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any,
    };

    mockInvoices[invoiceIndex] = updatedInvoice;

    return {
      success: true,
      data: updatedInvoice,
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'DB_OPERATION_FAILED',
        message: 'Failed to update invoice',
      },
    };
  }
}

export async function deleteInvoice(id: string): Promise<Result<void>> {
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

    // Check authorization - only Super Admin can delete invoices
    if (!hasFullInvoiceAccess(user.role)) {
      return {
        success: false,
        error: {
          code: 'AUTHZ_FORBIDDEN',
          message: 'Only Super Admin can delete invoices',
        },
      };
    }

    const invoiceIndex = mockInvoices.findIndex((inv) => inv.id === id);
    
    if (invoiceIndex === -1) {
      return {
        success: false,
        error: {
          code: 'DB_NOT_FOUND',
          message: 'Invoice not found',
        },
      };
    }

    mockInvoices.splice(invoiceIndex, 1);

    return {
      success: true,
      data: undefined,
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'DB_OPERATION_FAILED',
        message: 'Failed to delete invoice',
      },
    };
  }
}
