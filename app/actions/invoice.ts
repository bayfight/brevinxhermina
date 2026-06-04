'use server';

import { Invoice, Result, Category } from '@/types/models';
import { getCurrentUser } from '@/lib/auth-server';
import { hasFullInvoiceAccess, hasReadInvoiceAccess } from '@/lib/authorization';
import { db } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import { revalidatePath } from 'next/cache';

const COLLECTION_NAME = 'invoices';

function serializeTimestamp(timestamp: any) {
  if (!timestamp) return null;
  return {
    seconds: timestamp.seconds,
    nanoseconds: timestamp.nanoseconds,
  } as any;
}

function serializeInvoice(id: string, data: FirebaseFirestore.DocumentData): Invoice {
  return {
    id,
    invoiceNumber: data.invoiceNumber,
    resiId: data.resiId,
    poId: data.poId,
    category: data.category,
    invoiceTemplateUrl: data.invoiceTemplateUrl,
    deliveryNoteUrl: data.deliveryNoteUrl,
    poAttachmentUrl: data.poAttachmentUrl,
    receiptUrl: data.receiptUrl,
    resiNumber: data.resiNumber,
    totalAmount: data.totalAmount,
    billingLetterUrl: data.billingLetterUrl,
    createdBy: data.createdBy,
    createdAt: serializeTimestamp(data.createdAt),
    updatedAt: serializeTimestamp(data.updatedAt),
  };
}

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

    const snapshot = await db
      .collection(COLLECTION_NAME)
      .orderBy('createdAt', 'desc')
      .get();

    const invoices = snapshot.docs.map((doc) => serializeInvoice(doc.id, doc.data()));

    return {
      success: true,
      data: invoices,
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

    const doc = await db.collection(COLLECTION_NAME).doc(id).get();
    
    if (!doc.exists) {
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
      data: serializeInvoice(doc.id, doc.data()!),
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
  poId?: string;
  category?: Category;
  totalAmount?: number;
  invoiceTemplateUrl?: string;
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
    if (!input.invoiceNumber || !input.resiId || !input.deliveryNoteUrl || !input.receiptUrl) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_REQUIRED_FIELD',
          message: 'All fields including file uploads (Delivery Note and Receipt) are required',
        },
      };
    }

    // Check for duplicate invoice number
    const duplicateCheck = await db
      .collection(COLLECTION_NAME)
      .where('invoiceNumber', '==', input.invoiceNumber)
      .limit(1)
      .get();

    if (!duplicateCheck.empty) {
      return {
        success: false,
        error: {
          code: 'DB_DUPLICATE',
          message: 'An invoice with this number already exists',
        },
      };
    }

    // Fetch Resi data directly from Firestore
    const resiDoc = await db.collection('resis').doc(input.resiId).get();
    if (!resiDoc.exists) {
      return {
        success: false,
        error: {
          code: 'RESI_NOT_FOUND',
          message: 'Related Resi not found',
        },
      };
    }
    const resiData = resiDoc.data()!;

    // Fetch PO data directly from Firestore
    const poDoc = await db.collection('purchase_orders').doc(resiData.poId).get();
    const poData = poDoc.exists ? poDoc.data() : null;

    const now = Timestamp.now();
    
    const invoicePayload = {
      invoiceNumber: input.invoiceNumber,
      resiId: input.resiId,
      poId: input.poId || resiData.poId || '',
      category: input.category || resiData.category || 'kopi',
      invoiceTemplateUrl: input.invoiceTemplateUrl || '',
      deliveryNoteUrl: input.deliveryNoteUrl,
      poAttachmentUrl: poData ? poData.fileUrl : '#',
      receiptUrl: input.receiptUrl,
      resiNumber: resiData.resiNumber,
      totalAmount: input.totalAmount || 0,
      createdBy: user.uid,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await db.collection(COLLECTION_NAME).add(invoicePayload);

    // Automatically create a Finance Record linked to this new Invoice
    // Collection: finance_records
    await db.collection('finance_records').add({
      invoiceId: docRef.id,
      category: invoicePayload.category,
      paymentStatus: 'unpaid',
      amount: invoicePayload.totalAmount,
      createdAt: now,
      updatedAt: now,
    });

    revalidatePath('/invoice');
    revalidatePath('/finance');

    const doc = await docRef.get();

    return {
      success: true,
      data: serializeInvoice(doc.id, doc.data()!),
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
  poId?: string;
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

    const docRef = db.collection(COLLECTION_NAME).doc(id);
    const existing = await docRef.get();
    
    if (!existing.exists) {
      return {
        success: false,
        error: {
          code: 'DB_NOT_FOUND',
          message: 'Invoice not found',
        },
      };
    }

    // Check for duplicate invoice number if updating
    if (input.invoiceNumber && input.invoiceNumber !== existing.data()!.invoiceNumber) {
      const duplicateCheck = await db
        .collection(COLLECTION_NAME)
        .where('invoiceNumber', '==', input.invoiceNumber)
        .limit(1)
        .get();

      if (!duplicateCheck.empty) {
        return {
          success: false,
          error: {
            code: 'DB_DUPLICATE',
            message: 'An invoice with this number already exists',
          },
        };
      }
    }

    const updateData: Record<string, any> = {
      updatedAt: Timestamp.now(),
    };

    if (input.invoiceNumber !== undefined) updateData.invoiceNumber = input.invoiceNumber;
    if (input.resiId !== undefined) updateData.resiId = input.resiId;
    if (input.poId !== undefined) updateData.poId = input.poId;
    if (input.category !== undefined) updateData.category = input.category;
    if (input.totalAmount !== undefined) updateData.totalAmount = input.totalAmount;
    if (input.invoiceTemplateUrl !== undefined) updateData.invoiceTemplateUrl = input.invoiceTemplateUrl;
    if (input.deliveryNoteUrl !== undefined) updateData.deliveryNoteUrl = input.deliveryNoteUrl;
    if (input.receiptUrl !== undefined) updateData.receiptUrl = input.receiptUrl;

    await docRef.update(updateData);

    // Also update amount in Finance Record if totalAmount changes
    if (input.totalAmount !== undefined) {
      const financeSnapshot = await db
        .collection('finance_records')
        .where('invoiceId', '==', id)
        .limit(1)
        .get();

      if (!financeSnapshot.empty) {
        await financeSnapshot.docs[0].ref.update({
          amount: input.totalAmount,
          updatedAt: Timestamp.now(),
        });
      }
    }

    revalidatePath('/invoice');
    revalidatePath(`/invoice/${id}`);
    revalidatePath('/finance');

    const doc = await docRef.get();

    return {
      success: true,
      data: serializeInvoice(doc.id, doc.data()!),
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

    const docRef = db.collection(COLLECTION_NAME).doc(id);
    const existing = await docRef.get();
    
    if (!existing.exists) {
      return {
        success: false,
        error: {
          code: 'DB_NOT_FOUND',
          message: 'Invoice not found',
        },
      };
    }

    await docRef.delete();

    // Also delete linked Finance Record
    const financeSnapshot = await db
      .collection('finance_records')
      .where('invoiceId', '==', id)
      .get();

    for (const doc of financeSnapshot.docs) {
      await doc.ref.delete();
    }

    revalidatePath('/invoice');
    revalidatePath('/finance');

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

export async function updateInvoiceBillingLetter(
  invoiceId: string,
  billingLetterUrl: string
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

    if (!hasFullInvoiceAccess(user.role)) {
      return {
        success: false,
        error: {
          code: 'AUTHZ_FORBIDDEN',
          message: 'Only Super Admin can manage billing letters',
        },
      };
    }

    const docRef = db.collection(COLLECTION_NAME).doc(invoiceId);
    const existing = await docRef.get();
    
    if (!existing.exists) {
      return {
        success: false,
        error: {
          code: 'DB_NOT_FOUND',
          message: 'Invoice not found',
        },
      };
    }

    await docRef.update({
      billingLetterUrl,
      updatedAt: Timestamp.now(),
    });

    revalidatePath('/dashboard');
    revalidatePath('/invoice');
    revalidatePath(`/invoice/${invoiceId}`);

    const doc = await docRef.get();

    return {
      success: true,
      data: serializeInvoice(doc.id, doc.data()!),
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'DB_OPERATION_FAILED',
        message: 'Failed to update billing letter',
      },
    };
  }
}

