"use client";

import withMemberGuard from "@/components/auth/withMemberGuard";
import { AccountInfo, MemberInfo } from "@/components/member/account/AccountInfo";

function AccountInfoPage() {
  // mock – về sau map từ API profile
  const me: MemberInfo = {
    name: "Nguyễn Văn An",
    email: "tin.nguyenba1803@gmail.com",
    membershipTier: "gold",
    totalMiles: 45750,
    milesThisYear: 12500,
    nextTierMiles: 25000,
  };

  return <AccountInfo memberInfo={me} />;
}

export default withMemberGuard(AccountInfoPage);
