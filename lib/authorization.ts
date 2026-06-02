import 'server-only';

import { UserRole } from './auth-helpers';

export type Category = 'kopi' | 'aren' | 'syrup';

/**
 * Check if user has full access to Purchase Orders (create, read, update, delete)
 */
export function hasFullPOAccess(role: UserRole | null): boolean {
  if (!role) return false;
  return ['super_admin', 'hermina_account'].includes(role);
}

/**
 * Check if user has read-only access to Purchase Orders
 */
export function hasReadPOAccess(role: UserRole | null): boolean {
  if (!role) return false;
  return [
    'super_admin',
    'hermina_account',
    'staff_account',
    'kopi_merchant_account',
    'syrup_merchant_account',
  ].includes(role);
}

/**
 * Check if user has full access to Resi (create, read, update, delete)
 */
export function hasFullResiAccess(role: UserRole | null): boolean {
  if (!role) return false;
  return [
    'super_admin',
    'staff_account',
    'kopi_merchant_account',
    'syrup_merchant_account',
  ].includes(role);
}

/**
 * Check if user has read-only access to Resi
 */
export function hasReadResiAccess(role: UserRole | null): boolean {
  if (!role) return false;
  return [
    'super_admin',
    'hermina_account',
    'staff_account',
    'kopi_merchant_account',
    'syrup_merchant_account',
  ].includes(role);
}

/**
 * Check if user has full access to Invoices (create, read, update, delete)
 * Only Super Admin has full invoice access
 */
export function hasFullInvoiceAccess(role: UserRole | null): boolean {
  if (!role) return false;
  return role === 'super_admin';
}

/**
 * Check if user has read-only access to Invoices
 */
export function hasReadInvoiceAccess(role: UserRole | null): boolean {
  if (!role) return false;
  return ['super_admin', 'hermina_account'].includes(role);
}

/**
 * Check if user has access to Finance menu
 */
export function hasFinanceAccess(role: UserRole | null): boolean {
  if (!role) return false;
  return ['super_admin', 'kopi_merchant_account', 'syrup_merchant_account'].includes(role);
}

/**
 * Check if user can read Master Data Item menu
 */
export function hasMasterDataAccess(role: UserRole | null): boolean {
  if (!role) return false;
  return [
    'super_admin',
    'hermina_account',
    'staff_account',
    'kopi_merchant_account',
    'syrup_merchant_account',
  ].includes(role);
}

/**
 * Check if user can create, update, or delete Master Data Items
 */
export function hasFullMasterDataAccess(role: UserRole | null): boolean {
  return role === 'super_admin';
}

/**
 * Check if user can access a specific category
 * - Super Admin, Hermina Account, Staff Account: can access all categories
 * - Kopi Merchant: can access kopi and aren
 * - Syrup Merchant: can access syrup only
 */
export function canAccessCategory(role: UserRole | null, category: Category): boolean {
  if (!role) return false;

  // Super Admin, Hermina, and Staff can access all categories
  if (['super_admin', 'hermina_account', 'staff_account'].includes(role)) {
    return true;
  }

  // Kopi Merchant can access kopi and aren
  if (role === 'kopi_merchant_account') {
    return ['kopi', 'aren'].includes(category);
  }

  // Syrup Merchant can access syrup only
  if (role === 'syrup_merchant_account') {
    return category === 'syrup';
  }

  return false;
}

/**
 * Get allowed categories for a user role
 * Returns array of categories the user can access
 */
export function getAllowedCategories(role: UserRole | null): Category[] {
  if (!role) return [];

  // Super Admin, Hermina, and Staff can access all categories
  if (['super_admin', 'hermina_account', 'staff_account'].includes(role)) {
    return ['kopi', 'aren', 'syrup'];
  }

  // Kopi Merchant can access kopi and aren
  if (role === 'kopi_merchant_account') {
    return ['kopi', 'aren'];
  }

  // Syrup Merchant can access syrup only
  if (role === 'syrup_merchant_account') {
    return ['syrup'];
  }

  return [];
}

/**
 * Check if user is Super Admin
 */
export function isSuperAdmin(role: UserRole | null): boolean {
  return role === 'super_admin';
}

/**
 * Check if user has any PO access (read or write)
 */
export function hasPOAccess(role: UserRole | null): boolean {
  return hasReadPOAccess(role);
}

/**
 * Check if user has any Resi access (read or write)
 */
export function hasResiAccess(role: UserRole | null): boolean {
  return hasReadResiAccess(role);
}

/**
 * Check if user has any Invoice access (read or write)
 */
export function hasInvoiceAccess(role: UserRole | null): boolean {
  return hasReadInvoiceAccess(role);
}
