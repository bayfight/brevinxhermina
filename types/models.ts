import { Timestamp } from "firebase/firestore";

// User Roles
export type UserRole =
  | "super_admin"
  | "hermina_account"
  | "staff_account"
  | "kopi_merchant_account"
  | "syrup_merchant_account";

// Categories
export type Category = "kopi" | "aren" | "syrup";

// Resi Status
export type ResiStatus = "in_transit" | "delivered" | "cancelled";

// Payment Status
export type PaymentStatus = "paid" | "unpaid";

// Item Status
export type ItemStatus = "active" | "inactive";

// Location Type
export type LocationType = "kabupaten" | "kota";

// User Model
export interface User {
  uid: string;
  email: string;
  role: UserRole;
  displayName: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Purchase Order Model
export interface PurchaseOrder {
  id: string;
  poNumber: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  category: Category;
  uploadedBy: string;
  uploadedAt: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  metadata?: Record<string, any>;
}

// Resi Model
export interface Resi {
  id: string;
  resiNumber: string;
  poId: string;
  category: Category;
  senderPhone: string;
  receiverPhone: string;
  receiptUrl: string;
  receiptFileName: string;
  status: ResiStatus;
  uploadedBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Invoice Model
export interface Invoice {
  id: string;
  invoiceNumber: string;
  resiId: string;
  poId: string;
  category: Category;
  invoiceTemplateUrl: string;
  deliveryNoteUrl: string;
  poAttachmentUrl: string;
  receiptUrl: string;
  resiNumber: string;
  totalAmount?: number;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Finance Record Model
export interface FinanceRecord {
  id: string;
  invoiceId: string;
  category: Category;
  paymentStatus: PaymentStatus;
  amount: number;
  paidAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Master Data Item Model
export interface MasterDataItem {
  id: string;
  itemCode: string;
  name: string;
  category: Category;
  unit: string;
  price: number;
  status: ItemStatus;
  description?: string;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Master Data Location Model
export interface MasterDataLocation {
  id: string;
  locationCode: string;
  province: string;
  type: LocationType;
  name: string;
  status: ItemStatus;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Result Type for consistent error handling
export type Result<T> =
  | { success: true; data: T }
  | { success: false; error: ErrorResponse };

export interface ErrorResponse {
  code: string;
  message: string;
  details?: Record<string, any>;
}
