"use client";

import withMemberGuard from "@/components/auth/withMemberGuard";
import { RequestTracking } from "@/components/member/requests/RequestTracking";

function RequestTrackingPage() {
  return <RequestTracking />;
}

export default withMemberGuard(RequestTrackingPage);
