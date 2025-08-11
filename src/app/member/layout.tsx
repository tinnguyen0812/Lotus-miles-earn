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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
}
