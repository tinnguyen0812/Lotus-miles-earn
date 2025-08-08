"use client"

import { useEffect, useState } from 'react'
import { onAuthStateChanged, getIdTokenResult, User } from 'firebase/auth'
import { auth } from '@/lib/firebase'

type Role = 'admin' | 'member';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState<Role | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        try {
            const idTokenResult = await getIdTokenResult(user, true); // Force refresh
            const userRole = (idTokenResult.claims.role as Role) || 'member';
            setRole(userRole);
        } catch(error) {
            console.error("Error getting user token result:", error);
            // Handle error, maybe sign out user
            setRole('member'); // Fallback role
        }
      } else {
        setRole(null)
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, role, loading };
}
