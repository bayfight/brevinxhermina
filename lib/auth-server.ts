import 'server-only';

import { cookies } from 'next/headers';
import { verifyIdToken } from './firebase-admin';
import { UserRole } from './auth-helpers';

export interface AuthUser {
  uid: string;
  email: string | null;
  role: UserRole | null;
}

/**
 * Get the current authenticated user from the auth token cookie
 * This function can only be used in Server Components and Server Actions
 * @returns The authenticated user or null if not authenticated
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return null;
    }

    const decodedToken = await verifyIdToken(token);

    return {
      uid: decodedToken.uid,
      email: decodedToken.email || null,
      role: (decodedToken.role as UserRole) || null,
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Require authentication - throws an error if user is not authenticated
 * Use this in Server Actions that require authentication
 */
export async function requireAuth(): Promise<AuthUser> {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error('Authentication required');
  }
  
  return user;
}
