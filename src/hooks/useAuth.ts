
'use client'
import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'

type Role = 'admin' | 'member';

export function useAuth(expectedRole?: Role) {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState<Role | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    try {
      const token = localStorage.getItem('token');
      const storedRole = localStorage.getItem('role') as Role | null;
      
      if (token && storedRole) {
        setIsAuthenticated(true);
        setRole(storedRole);

        if (expectedRole && storedRole !== expectedRole) {
            const targetPath = storedRole === 'admin' ? '/admin/claims' : '/member/dashboard';
            router.replace(targetPath);
        }

      } else {
         setIsAuthenticated(false);
         setRole(null);
         // Redirect if on a protected route
         if (pathname.startsWith('/member') || pathname.startsWith('/admin')) {
            const loginPath = pathname.startsWith('/admin') ? '/admin/login' : '/login';
            router.replace(loginPath);
         }
      }
    } catch (e) {
        // localStorage can throw errors in some environments
        console.error("Auth check failed", e);
        setIsAuthenticated(false);
        setRole(null);
    } finally {
        setLoading(false);
    }
  }, [pathname, router, expectedRole]);

  return { loading, isAuthenticated, role };
}
