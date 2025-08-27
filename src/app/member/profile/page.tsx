"use client";

import { useEffect, useState } from "react";
import withMemberGuard from "@/components/auth/withMemberGuard";
import { AccountInfo, MemberInfo } from "@/components/member/account/AccountInfo";
import { callApi } from "@/lib/api-client";
import { useTranslation } from "@/lib/i18n";

type TierItem = {
  tier_name: string;
  min_points: number;
  max_points: number;
  priority: number;
  benefit?: { vi?: string; en?: string }[];
  next_tier?: string | null;
};

type TiersResp = { success: boolean; data?: TierItem[] };

type ProfileResp = {
  success: boolean;
  data?: {
    user_email: string;
    first_name?: string | null;
    last_name?: string | null;
    dob?: string | null;
    phone_numbers?: string | null;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    zip?: string | null;
    country?: string | null;
    ward?: string | null;
    district?: string | null;
    tier?: {
      tier_name?: string | null;
      min_points?: number;
      max_points?: number;
      priority?: number;
      benefit?: { vi?: string; en?: string }[];
      next_tier?: string | null;
    };
    points?: {
      total_points?: number;
      available_points?: number;
    };
  };
};

function normalizeTierName(n?: string | null): MemberInfo["membershipTier"] {
  switch ((n || "").toLowerCase()) {
    case "gold": return "gold";
    case "silver": return "silver";
    case "platinum": return "platinum"; // để phòng có thêm
    case "bronze": return "bronze"
    default:
      return "member";
  }
}

function findCurrentTier(tiers: TierItem[], total: number): TierItem | undefined {
  // lấy tier có min_points <= total và có min_points lớn nhất
  return tiers
    .filter((t) => typeof t.min_points === "number" && total >= t.min_points)
    .sort((a, b) => b.min_points - a.min_points)[0];
}

function findNextTier(tiers: TierItem[], total: number): TierItem | undefined {
  // tier có min_points > total và nhỏ nhất
  return tiers
    .filter((t) => typeof t.min_points === "number" && total < t.min_points)
    .sort((a, b) => a.min_points - b.min_points)[0];
}

function benefitsByLocale(
  arr: { vi?: string; en?: string }[] | undefined,
  locale: string
) {
  if (!arr) return [];
  const lang = locale?.toLowerCase().startsWith("vi") ? "vi" : "en";
  return arr
    .map(b => (lang === "vi" ? b.vi : b.en) || b.en || b.vi)
    .filter(Boolean) as string[];
}

const MOCK: MemberInfo = {
  name: "Member",
  email: "member@example.com",
  membershipTier: "member",
  totalMiles: 150,
  milesThisYear: 150,
  nextTierMiles: 350, // ví dụ tới silver 500,
  phoneNumber: "",
  dob: "",
  address: "",
  city: "",
  state: "",
  zip: "",
  country: "",
};

export default withMemberGuard(function AccountInfoPage() {
  const { locale } = useTranslation();        // <-- DÙNG LOCALE TRONG APP
  const [member, setMember] = useState<MemberInfo | null>(null);
  const [benefits, setBenefits] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token") || "";
    const userId = localStorage.getItem("user_id") || localStorage.getItem("userId") || "";

    (async () => {
      try {
        const [profile, tiers] = await Promise.all([
          callApi<ProfileResp>({
            method: "GET",
            path: "/ms-users/member/profile",
            headers: { Authorization: `Bearer ${token}`, "x-user-id": userId },
          }),
          callApi<TiersResp>({ method: "GET", path: "/ms-reward/tiers", headers: { Authorization: `Bearer ${token}`, "x-user-id": userId }, }),
        ]);

        const p = profile?.data;
        const tiersArr = tiers?.data ?? [];
        if (!p) throw new Error("profile failed");

        const total = p.points?.total_points ?? 0;
        const available = p.points?.available_points ?? 0;

        const tierObj = findCurrentTier(tiersArr, total);
        const currentTierName = tierObj?.tier_name || p.tier?.tier_name || "bronze";
        const nextTier = findNextTier(tiersArr, total);
        const distance = nextTier ? Math.max(0, nextTier.min_points - total) : 0;

        // >>> CHỌN BENEFITS THEO LOCALE TỪ CONTEXT
        const fromProfile = benefitsByLocale(p.tier?.benefit, locale);
        const fromTable = benefitsByLocale(tierObj?.benefit, locale);
        const finalBenefits = fromProfile.length ? fromProfile : fromTable;

        const fullName =
          [p.first_name, p.last_name].filter(Boolean).join(" ") ||
          p.user_email?.split("@")[0] ||
          "Member";

        const mapped: MemberInfo = {
          name: fullName,
          email: p.user_email,
          membershipTier: normalizeTierName(currentTierName),
          totalMiles: total,
          milesThisYear: available,
          nextTierMiles: distance,

          phoneNumber: p.phone_numbers || "",
          dob: (p.dob || "").slice(0, 10),
          address: p.address || "",
          city: p.city || "",
          state: p.state || "",
          zip: p.zip || "",
          country: p.country || "",
          district: p.district || "",     // NEW
          ward: p.ward || "",   
        };

        setMember(mapped);
        setBenefits(finalBenefits);
      } catch {
        setMember(MOCK);
        setBenefits([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [locale]);  // đổi ngôn ngữ => refetch benefits theo locale

  if (loading || !member) {
    return (
      <div className="p-6">
        <div className="h-6 w-48 animate-pulse rounded bg-teal-100 mb-4" />
        <div className="h-48 animate-pulse rounded bg-teal-50" />
      </div>
    );
  }

  return <AccountInfo memberInfo={member} benefits={benefits} />;
});
