# Firestore Collections Structure

This document describes the Firestore collections, their structure, and required indexes for the PO-Resi-Invoice Dashboard.

## Collections Overview

The system uses seven main Firestore collections:
1. `users` - User accounts and roles
2. `purchase_orders` - Purchase order documents
3. `resis` - Shipping receipts
4. `invoices` - Invoice documents
5. `finance_records` - Financial tracking records
6. `master_data_items` - Item catalog sold by the business
7. `master_data_locations` - Indonesian regency/city location master data

## Collection Schemas

### 1. Users Collection (`users`)

**Document ID**: Firebase Auth UID

**Fields**:
- `uid` (string) - Firebase Auth UID (matches document ID)
- `email` (string) - User email address
- `role` (string) - User role enum: `super_admin`, `hermina_account`, `staff_account`, `kopi_merchant_account`, `syrup_merchant_account`
- `displayName` (string) - User display name
- `createdAt` (timestamp) - Account creation timestamp
- `updatedAt` (timestamp) - Last update timestamp

**Single Field Indexes**:
- `role` (ascending)
- `email` (ascending)

**Access Control**:
- Read: Authenticated users can read their own document, Super Admin can read all
- Write: Super Admin only

---

### 2. Purchase Orders Collection (`purchase_orders`)

**Document ID**: Auto-generated

**Fields**:
- `id` (string) - Document ID (auto-generated)
- `poNumber` (string) - Business purchase order number
- `fileUrl` (string) - Firebase Storage download URL
- `fileName` (string) - Original file name
- `fileSize` (number) - File size in bytes
- `category` (string) - Category enum: `kopi`, `aren`, `syrup`
- `uploadedBy` (string) - User UID who uploaded the PO
- `uploadedAt` (timestamp) - Upload timestamp
- `createdAt` (timestamp) - Document creation timestamp
- `updatedAt` (timestamp) - Last update timestamp
- `metadata` (map, optional) - Additional PO metadata

**Single Field Indexes**:
- `poNumber` (ascending)
- `category` (ascending)
- `uploadedBy` (ascending)

**Composite Indexes**:
- `category` (ascending) + `createdAt` (descending)

**Access Control**:
- Read: All authenticated users with category filtering
- Create: Super Admin, Hermina Account
- Update/Delete: Super Admin, Hermina Account (with category access)

**Storage Path**: `/purchase-orders/{poId}/{filename}`

---

### 3. Resis Collection (`resis`)

**Document ID**: Auto-generated

**Fields**:
- `id` (string) - Document ID (auto-generated)
- `resiNumber` (string) - Tracking/receipt number
- `poId` (string) - Reference to Purchase Order document ID
- `category` (string) - Category enum: `kopi`, `aren`, `syrup`
- `senderPhone` (string) - Sender phone number
- `receiverPhone` (string) - Receiver phone number
- `receiptUrl` (string) - Firebase Storage download URL for receipt proof
- `receiptFileName` (string) - Original receipt file name
- `status` (string) - Status enum: `in_transit`, `delivered`, `cancelled`
- `uploadedBy` (string) - User UID who created the Resi
- `createdAt` (timestamp) - Document creation timestamp
- `updatedAt` (timestamp) - Last update timestamp

**Single Field Indexes**:
- `resiNumber` (ascending)
- `poId` (ascending)
- `category` (ascending)
- `status` (ascending)

**Composite Indexes**:
- `category` (ascending) + `status` (ascending)
- `status` (ascending) + `createdAt` (descending)

**Access Control**:
- Read: Super Admin, Hermina Account, Staff Account, Merchant Accounts (with category filtering)
- Create: Super Admin, Staff Account, Merchant Accounts
- Update/Delete: Super Admin, Staff Account, Merchant Accounts (with category access)

**Storage Path**: `/resis/{resiId}/{filename}`

---

### 4. Invoices Collection (`invoices`)

**Document ID**: Auto-generated

**Fields**:
- `id` (string) - Document ID (auto-generated)
- `invoiceNumber` (string) - Business invoice number
- `resiId` (string) - Reference to Resi document ID
- `poId` (string) - Reference to Purchase Order document ID (from Resi)
- `category` (string) - Category enum: `kopi`, `aren`, `syrup`
- `invoiceTemplateUrl` (string) - Firebase Storage download URL for invoice template
- `deliveryNoteUrl` (string) - Firebase Storage download URL for delivery note
- `poAttachmentUrl` (string) - Copied from PO fileUrl
- `receiptUrl` (string) - Firebase Storage download URL for receipt
- `resiNumber` (string) - Copied from Resi resiNumber
- `totalAmount` (number, optional) - Invoice total amount
- `createdBy` (string) - User UID who created the invoice
- `createdAt` (timestamp) - Document creation timestamp
- `updatedAt` (timestamp) - Last update timestamp

**Single Field Indexes**:
- `invoiceNumber` (ascending)
- `resiId` (ascending)
- `poId` (ascending)
- `category` (ascending)

**Composite Indexes**:
- `category` (ascending) + `createdAt` (descending)

**Access Control**:
- Read: Super Admin, Hermina Account (with category filtering)
- Create/Update/Delete: Super Admin only

**Storage Paths**:
- `/invoices/{invoiceId}/template/{filename}`
- `/invoices/{invoiceId}/delivery-note/{filename}`
- `/invoices/{invoiceId}/receipt/{filename}`

---

### 5. Finance Records Collection (`finance_records`)

**Document ID**: Auto-generated

**Fields**:
- `id` (string) - Document ID (auto-generated)
- `invoiceId` (string) - Reference to Invoice document ID
- `category` (string) - Category enum: `kopi`, `aren`, `syrup`
- `paymentStatus` (string) - Payment status enum: `paid`, `unpaid`
- `amount` (number) - Payment amount
- `paidAt` (timestamp, optional) - Payment timestamp (if paid)
- `createdAt` (timestamp) - Document creation timestamp
- `updatedAt` (timestamp) - Last update timestamp

**Single Field Indexes**:
- `invoiceId` (ascending)
- `paymentStatus` (ascending)
- `category` (ascending)

**Composite Indexes**:
- `category` (ascending) + `paymentStatus` (ascending)
- `paymentStatus` (ascending) + `createdAt` (descending)

**Access Control**:
- Read: Super Admin, Kopi Merchant Account (kopi/aren only), Syrup Merchant Account (syrup only)
- Write: Super Admin only

---

### 6. Master Data Items Collection (`master_data_items`)

**Document ID**: Auto-generated

**Fields**:
- `id` (string) - Document ID (auto-generated, returned by application)
- `itemCode` (string) - Unique item code, normalized to uppercase
- `name` (string) - Item display name
- `category` (string) - Category enum: `kopi`, `aren`, `syrup`
- `unit` (string) - Selling unit, for example `pcs`, `box`, or `kg`
- `price` (number) - Item price in IDR
- `status` (string) - Status enum: `active`, `inactive`
- `description` (string, optional) - Additional item notes
- `createdBy` (string) - User UID who created the item
- `createdAt` (timestamp) - Document creation timestamp
- `updatedAt` (timestamp) - Last update timestamp

**Single Field Indexes**:
- `itemCode` (ascending)
- `category` (ascending)
- `status` (ascending)
- `createdAt` (descending)

**Access Control**:
- Read: All authenticated dashboard users
- Create/Update/Delete: Super Admin only

**Application Route**: `/master-data`

---

### 7. Master Data Locations Collection (`master_data_locations`)

**Document ID**: Auto-generated

**Fields**:
- `id` (string) - Document ID (auto-generated, returned by application)
- `locationCode` (string) - Unique location code, normalized to uppercase
- `province` (string) - Province name
- `type` (string) - Location type enum: `kabupaten`, `kota`
- `name` (string) - Kabupaten/Kota name
- `status` (string) - Status enum: `active`, `inactive`
- `createdBy` (string) - User UID who created the location
- `createdAt` (timestamp) - Document creation timestamp
- `updatedAt` (timestamp) - Last update timestamp

**Single Field Indexes**:
- `locationCode` (ascending)
- `province` (ascending)
- `type` (ascending)
- `status` (ascending)

**Composite Indexes**:
- `province` (ascending) + `name` (ascending)

**Access Control**:
- Read: All authenticated dashboard users
- Create/Update/Delete: Super Admin only

**Application Route**: `/master-data-lokasi`

---

## Data Relationships

```
PurchaseOrder (1) ──→ (N) Resi
                         │
                         └──→ (1) Invoice ──→ (1) FinanceRecord
```

**Workflow**:
1. Purchase Order is created with file upload
2. Resi is created and linked to PO via `poId`
3. Invoice is created and linked to Resi via `resiId` (automatically includes `poId` from Resi)
4. Finance Record is created and linked to Invoice via `invoiceId`

---

## Index Deployment

All indexes are defined in `firestore.indexes.json` and can be deployed using:

```bash
firebase deploy --only firestore:indexes
```

## Security Rules Deployment

Firestore security rules are defined in `firestore.rules` and can be deployed using:

```bash
firebase deploy --only firestore:rules
```

Storage security rules are defined in `storage.rules` and can be deployed using:

```bash
firebase deploy --only storage
```

## Query Examples

### Get POs by category, sorted by creation date
```typescript
const posQuery = query(
  collection(db, 'purchase_orders'),
  where('category', '==', 'kopi'),
  orderBy('createdAt', 'desc')
);
```

### Get in-transit Resis by category
```typescript
const resisQuery = query(
  collection(db, 'resis'),
  where('category', '==', 'kopi'),
  where('status', '==', 'in_transit')
);
```

### Get unpaid finance records by category
```typescript
const financeQuery = query(
  collection(db, 'finance_records'),
  where('category', '==', 'kopi'),
  where('paymentStatus', '==', 'unpaid')
);
```

### Get recent invoices by category
```typescript
const invoicesQuery = query(
  collection(db, 'invoices'),
  where('category', '==', 'syrup'),
  orderBy('createdAt', 'desc'),
  limit(10)
);
```

---

## Notes

- All timestamps use Firestore `Timestamp` type
- Document IDs are auto-generated by Firestore unless specified
- Category filtering is enforced at both application and security rules level
- File URLs are public download URLs from Firebase Storage
- All collections require authentication for access
- Role-based access control is enforced via custom claims in Firebase Auth tokens
