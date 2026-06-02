import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth-server';
import { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
}

/**
 * Server Component that protects routes by checking authentication
 * Redirects to login if user is not authenticated
 * Passes user data to children components
 */
export async function ProtectedRoute({ children }: ProtectedRouteProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  return <>{children}</>;
}
