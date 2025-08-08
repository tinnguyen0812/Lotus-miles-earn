
"use client";

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export default function withAdminGuard<T extends object>(Component: React.ComponentType<T>) {
  return function Guarded(props: T) {
    const { isAuthenticated, role, loading } = useAuth('admin');
    const router = useRouter();
    const { toast } = useToast();

    useEffect(() => {
        if (loading) {
            return;
        }
        if (!isAuthenticated) {
            router.replace('/admin/login');
        } else if (role !== 'admin') {
            toast({
                title: "Permission Denied",
                description: "You do not have permission to access this page.",
                variant: "destructive",
            })
            router.replace('/login'); // Redirect non-admins away
        }
    }, [isAuthenticated, role, loading, router, toast]);

    if (loading || !isAuthenticated || role !== 'admin') {
      return (
        <div className="flex h-screen w-full items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-muted-foreground">Verifying access...</p>
            </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
}
