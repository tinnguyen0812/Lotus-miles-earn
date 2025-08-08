
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function Home() {
  const router = useRouter();
  const { role, loading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (isAuthenticated) {
        if (role === 'admin') {
          router.replace("/admin/claims");
        } else {
          router.replace("/member/dashboard");
        }
      } else {
        router.replace("/login");
      }
    }
  }, [router, role, loading, isAuthenticated]);

  return (
    <div className="flex h-screen w-full items-center justify-center">
       <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-muted-foreground">Loading your experience...</p>
      </div>
    </div>
  );
}
