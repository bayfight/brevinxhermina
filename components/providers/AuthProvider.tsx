'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/lib/firebase-client';
import { UserRole } from '@/lib/auth-helpers';

interface AuthContextType {
  user: FirebaseUser | null;
  role: UserRole | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  loading: true,
});

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Client-side authentication provider
 * Manages Firebase Auth state and provides user object and role to child components
 * Wraps the application to provide auth context throughout the component tree
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        // Get the ID token to extract custom claims (role)
        try {
          const idTokenResult = await firebaseUser.getIdTokenResult();
          const userRole = idTokenResult.claims.role as UserRole | undefined;
          setRole(userRole || null);
        } catch (error) {
          console.error('Error getting user role:', error);
          setRole(null);
        }
      } else {
        setRole(null);
      }

      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to access auth context
 * Must be used within AuthProvider
 */
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  
  return context;
}
