
"use client";

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

export default function withMemberGuard<T extends object>(Component: React.ComponentType<T>) {
  return function Guarded(props: T) {
    const { loading, isAuthenticated, role } = useAuth('member');
    const router = useRouter();

    useEffect(() => {
      if (!loading && (!isAuthenticated || role !== 'member')) {
        router.replace('/login');
      }
    }, [isAuthenticated, role, loading, router]);

    if (loading || !isAuthenticated || role !== 'member') {
       return (
        <div className="flex h-screen w-full items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-muted-foreground">Loading your dashboard...</p>
            </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
}
