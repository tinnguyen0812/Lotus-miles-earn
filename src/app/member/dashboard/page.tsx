"use client";

import * as React from "react";
import withMemberGuard from "@/components/auth/withMemberGuard";
import { MemberDashboard, type MemberInfo } from "@/components/member/cards/SummaryCard";
import { callApi } from "@/lib/api-client";

type TierDTO = {
  id: string;
  tier_name: string; // "bronze" | "silver" | "gold"
  min_points: number;
  max_points: number;
  priority: number;
  next_tier: string | null;
  previous_tier: string | null;
};

type ProfileDTO = {
  user_email: string;
  first_name?: string;
  last_name?: string;
  tier?: {
    tier_name: string;
    min_points: number;
    max_points: number;
    next_tier: string | null;
  };
  points?: {
    total_points: number;      // tổng tích lũy từ trước tới nay
    available_points: number;  // có thể coi là miles trong kỳ/năm hiện tại (nếu backend dùng vậy)
  };
};

type ApiProfileResp = { success: boolean; data: ProfileDTO };
type ApiTiersResp = { success: boolean; data: TierDTO[] };

function mapTierToLabel(apiName: string): MemberInfo["membershipTier"] {
  switch ((apiName || "").toLowerCase()) {
    case "gold":
      return "Gold";
    case "silver":
      return "Silver";
    // "bronze" coi như base tier -> Member
    default:
      return "Bronze";
  }
}

function DashboardPage() {
  const [memberInfo, setMemberInfo] = React.useState<MemberInfo | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token") || "";
        const userId = localStorage.getItem("user_id") || localStorage.getItem("userId") || "";

        // 1) Profile
        const prof = await callApi<ApiProfileResp>({
          method: "GET",
          path: "/ms-users/member/profile",
          headers: {
            Authorization: `Bearer ${token}`,
            "x-user-id": userId,
          } as any,
        });

        // 2) Tiers
        const tiersRes = await callApi<ApiTiersResp>({
          method: "GET",
          path: "/ms-reward/tiers",
          headers: {
            Authorization: `Bearer ${token}`,
            "x-user-id": userId,
          } as any,
        });

        const tiers = (tiersRes?.data || []).slice().sort((a, b) => a.min_points - b.min_points);

        const fullName =
          `${prof?.data?.first_name || ""} ${prof?.data?.last_name || ""}`.trim() || "Member";

        const apiTierName = prof?.data?.tier?.tier_name || "bronze";
        const tierLabel = mapTierToLabel(apiTierName);

        const total = prof?.data?.points?.total_points ?? 0;
        const thisYear = prof?.data?.points?.available_points ?? 0;

        // Tìm mốc lên hạng tiếp theo (min_points của tier kế tiếp)
        const curTier = tiers.find(
          (t) => t.tier_name.toLowerCase() === String(apiTierName).toLowerCase()
        );
        let nextThreshold = 0;
        if (curTier?.next_tier) {
          const next = tiers.find((t) => t.tier_name === curTier.next_tier);
          nextThreshold = next?.min_points ?? 0;
        } else {
          // Nếu API không set next_tier, lấy tier có min_points > current
          const next = tiers.find((t) => t.min_points > (curTier?.min_points ?? -1));
          nextThreshold = next?.min_points ?? 0;
        }

        const info: MemberInfo = {
          name: fullName,
          email: prof?.data?.user_email || "",
          membershipTier: tierLabel,
          totalMiles: total,
          milesThisYear: thisYear,
          // Component sẽ dùng nextTierMiles để tính progress theo totalMiles
          nextTierMiles: nextThreshold || 0,
        };

        if (!cancelled) setMemberInfo(info);
      } catch (e) {
        console.error("Dashboard fetch error:", e);
        // Fallback mock
        if (!cancelled) {
          setMemberInfo({
            name: "Nguyễn Văn An",
            email: "tin.nguyenba1803@gmail.com",
            membershipTier: "Gold",
            totalMiles: 45750,
            milesThisYear: 12500,
            nextTierMiles: 100000, // mock mốc (không dùng thực tế)
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!memberInfo) {
    return (
      <div className="p-6">
        {loading ? (
          <div className="text-sm text-muted-foreground">Loading…</div>
        ) : (
          <div className="text-sm text-destructive">Failed to load dashboard.</div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <MemberDashboard memberInfo={memberInfo} />
    </div>
  );
}

export default withMemberGuard(DashboardPage);
