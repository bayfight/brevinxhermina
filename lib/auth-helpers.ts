// Helper functions for authentication that can be used in middleware
// These don't import firebase-admin directly to avoid edge runtime issues

export type UserRole =
  | 'super_admin'
  | 'hermina_account'
  | 'staff_account'
  | 'kopi_merchant_account'
  | 'syrup_merchant_account';

export function hasFinanceAccess(role: UserRole | null): boolean {
  if (!role) return false;
  return ['super_admin', 'kopi_merchant_account', 'syrup_merchant_account'].includes(role);
}

export function hasFullPOAccess(role: UserRole | null): boolean {
  if (!role) return false;
  return ['super_admin', 'hermina_account'].includes(role);
}

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

export function hasFullResiAccess(role: UserRole | null): boolean {
  if (!role) return false;
  return [
    'super_admin',
    'staff_account',
    'kopi_merchant_account',
    'syrup_merchant_account',
  ].includes(role);
}

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

export function hasFullInvoiceAccess(role: UserRole | null): boolean {
  if (!role) return false;
  return ['super_admin', 'hermina_account'].includes(role);
}

export function hasReadInvoiceAccess(role: UserRole | null): boolean {
  if (!role) return false;
  return ['super_admin', 'hermina_account'].includes(role);
}
