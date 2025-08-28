// app/member/layout.tsx
import type { Metadata } from "next";
import MemberLayoutClient from "@/components/member/layout/MemberLayout";

export const metadata = {
  title: "Lotus Loyalty Center", // chỉ cần default string
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <MemberLayoutClient>{children}</MemberLayoutClient>;
}