"use client";

import withMemberGuard from "@/components/auth/withMemberGuard";
import { MilesHistory } from "@/components/member/history/MilesHistory";

function HistoryPage() {
  return <MilesHistory />;
}

export default withMemberGuard(HistoryPage);
