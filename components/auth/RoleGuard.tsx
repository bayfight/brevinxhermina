import { ReactNode } from 'react';
import { getCurrentUser } from '@/lib/auth-server';
import { UserRole } from '@/lib/auth-helpers';

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
  requireAuth?: boolean;
  fallback?: ReactNode;
}

/**
 * Server Component that conditionally renders children based on user role
 * Shows "Access Denied" message or custom fallback if unauthorized
 * 
 * @param children - Content to render if authorized
 * @param allowedRoles - Array of roles that can access the content
 * @param requireAuth - If true, requires authentication (default: true)
 * @param fallback - Custom content to show if unauthorized (default: Access Denied message)
 */
export async function RoleGuard({
  children,
  allowedRoles,
  requireAuth = true,
  fallback,
}: RoleGuardProps) {
  const user = await getCurrentUser();

  // Check authentication requirement
  if (requireAuth && !user) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Authentication Required
            </h2>
            <p className="text-gray-600">
              Please log in to access this content.
            </p>
          </div>
        </div>
      )
    );
  }

  // Check role requirement
  if (allowedRoles && user) {
    const hasAccess = user.role && allowedRoles.includes(user.role);
    
    if (!hasAccess) {
      return (
        fallback || (
          <div className="flex items-center justify-center min-h-[200px]">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Access Denied
              </h2>
              <p className="text-gray-600">
                You don&apos;t have permission to access this content.
              </p>
            </div>
          </div>
        )
      );
    }
  }

  return <>{children}</>;
}
