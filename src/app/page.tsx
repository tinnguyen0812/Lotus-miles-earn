"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // This simulates checking auth state and redirecting.
    // In a real app, you'd check for a valid session.
    router.replace("/dashboard");
  }, [router]);

  return (
    <div className="flex h-screen w-full items-center justify-center">
       <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-muted-foreground">Loading your experience...</p>
      </div>
    </div>
  );
}
