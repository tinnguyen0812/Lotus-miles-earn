// src/components/member/layout/MemberLayout.tsx
"use client";

import { MemberHeader } from "@/components/member/layout/MemberHeader";

export default function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <MemberHeader />
      <main className="mx-auto w-full max-w-screen-xl px-3 sm:px-4 lg:px-6">
        {children}
      </main>
    </div>
  );
}
