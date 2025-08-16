"use client";

import { useRouter } from "next/navigation";
import { DashboardOverview } from "@/components/admin/DashboardOverview";

export default function AdminDashboardPage() {
  const router = useRouter();
  return (
    <DashboardOverview
      onNavigateToRequests={() => router.push("/admin/claims")} // đổi route nếu bạn dùng khác
    />
  );
}
