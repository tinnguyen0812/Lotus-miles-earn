"use client";

import withMemberGuard from "@/components/auth/withMemberGuard";
import ManualMilesRequest from "@/components/member/claims/ManualMilesRequest";

function Page() {
  return <ManualMilesRequest />;
}

export default withMemberGuard(Page);
