"use client";

import * as React from "react";
import withMemberGuard from "@/components/auth/withMemberGuard";
import { MemberDashboard, type MemberInfo } from "@/components/member/cards/SummaryCard";

// TODO: Khi có API profile, lấy dữ liệu thực thay cho mock dưới đây.
function DashboardPage() {
  // Mock demo để xem UI. Thay bằng dữ liệu thật từ API/decoded token khi sẵn sàng.
  const memberInfo = React.useMemo<MemberInfo>(
    () => ({
      name: "Nguyễn Văn An",
      email: "tin.nguyenba1803@gmail.com",
      membershipTier: "Gold",      // "Platinum" | "Gold" | "Silver" | "Member"
      totalMiles: 45750,
      milesThisYear: 12500,
      nextTierMiles: 25000,        // mốc cần để lên hạng kế tiếp
    }),
    []
  );

  return (
    <div className="space-y-6">
      <MemberDashboard memberInfo={memberInfo} />
    </div>
  );
}

export default withMemberGuard(DashboardPage);
