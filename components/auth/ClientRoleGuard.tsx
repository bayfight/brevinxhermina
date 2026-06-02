'use client';

import { ReactNode } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { UserRole } from '@/lib/auth-helpers';

interface ClientRoleGuardProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
  requireAuth?: boolean;
  fallback?: ReactNode;
  showLoading?: boolean;
}

/**
 * Client Component that conditionally renders children based on user role
 * Uses client-side auth context from AuthProvider
 * Useful for conditional rendering in client components
 * 
 * @param children - Content to render if authorized
 * @param allowedRoles - Array of roles that can access the content
 * @param requireAuth - If true, requires authentication (default: true)
 * @param fallback - Custom content to show if unauthorized
 * @param showLoading - If true, shows loading state while checking auth (default: false)
 */
export function ClientRoleGuard({
  children,
  allowedRoles,
  requireAuth = true,
  fallback,
  showLoading = false,
}: ClientRoleGuardProps) {
  const { user, role, loading } = useAuth();

  // Show loading state if requested
  if (loading && showLoading) {
    return (
      <div className="flex items-center justify-center min-h-[100px]">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  // Don't render anything while loading (unless showLoading is true)
  if (loading) {
    return null;
  }

  // Check authentication requirement
  if (requireAuth && !user) {
    return fallback || null;
  }

  // Check role requirement
  if (allowedRoles && user) {
    const hasAccess = role && allowedRoles.includes(role);
    
    if (!hasAccess) {
      return fallback || null;
    }
  }

  return <>{children}</>;
}
