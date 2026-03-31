'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  adminRole: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  adminRole: false,
  loading: true,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [adminRole, setAdminRole] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        
        // Hardcoded master admin check
        if (firebaseUser.email === 'jvdhussain2008@gmail.com') {
          setAdminRole(true);
        } else {
          // Check role in /users collection
          try {
            const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
            if (userDoc.exists() && userDoc.data().role === 'admin') {
              setAdminRole(true);
            } else {
              setAdminRole(false);
            }
          } catch (error) {
            console.error("Error checking admin role:", error);
            setAdminRole(false);
          }
        }
      } else {
        setUser(null);
        setAdminRole(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!loading) {
      if (!user || (!adminRole && user.email !== 'jvdhussain2008@gmail.com')) {
        if (pathname !== '/login') {
          router.push('/login');
        }
      } else if (user && adminRole && pathname === '/login') {
        router.push('/');
      }
    }
  }, [user, adminRole, loading, pathname, router]);

  return (
    <AuthContext.Provider value={{ user, adminRole, loading }}>
      {loading ? (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent shadow-sm" />
          <p className="text-sm font-semibold text-slate-500 animate-pulse tracking-wide">Authenticating Admin Workspace...</p>
        </div>
      ) : (!user && pathname !== '/login') ? null : (
        children
      )}
    </AuthContext.Provider>
  );
};
