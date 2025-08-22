"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft, Mail, Phone, Calendar, MapPin, CreditCard,
  Plane, TrendingUp, Activity, User, Loader2
} from "lucide-react";
import { callApi } from "@/lib/api-client";
import { useTranslation } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";

interface MemberDetailProps {
  memberId: string;
}

/** ===== Types khớp response API ===== */
type TierApi = {
  id: string;
  tier_name: string;
  tier_description?: string;
  min_points?: number;
  max_points?: number;
  priority?: number;
  benefit?: Array<{ en?: string; vi?: string }>;
};

type PointsApi = {
  id: string;
  total_points: number;
  used_points: number;
  balance_points: number;
  available_points: number;
  updated_at: string;
  created_at: string;
};

type UserApi = {
  id: string;
  user_name?: string;
  user_email?: string | null;
  user_type?: string;
  first_name?: string | null;
  last_name?: string | null;
  gender?: string | null;
  dob?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  ward?: string | null;
  zip?: string | null;
  country?: string | null;
  phone_numbers?: string | null;
  user_number?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  status?: "active" | "inactive" | string;
  district?: string | null;
  tier?: TierApi | null;
  points?: PointsApi | null;
};

type MemberStats = {
  total_accumulated_points: number;
  total_spent_points: number;
  current_balance: number;
  total_transactions: number;
  monthly_transactions: number;
  monthly_earned_points: number;
  monthly_spent_points: number;
  total_manual_requests: number;
  pending_manual_requests: number;
  processed_manual_requests: number;
  rejected_manual_requests: number;
  monthly_manual_requests: number;
  total_manual_approved_points: number;
  membership_duration_days: number;
};

type TxApiItem = {
  id: string;
  transaction_type: "earn" | "burn" | string;
  description?: string;
  transaction_date?: string;
  created_at?: string;
  status?: string;
  points_used?: number;
  user?: { id?: string };
};

/** Helper: bóc payload an toàn cho mọi kiểu trả về của callApi */
const unwrap = (r: any) => r?.data?.data ?? r?.data ?? r;

export default function MemberDetail({ memberId }: MemberDetailProps) {
  const router = useRouter();
  const { toast } = useToast?.() ?? { toast: undefined as any };

  // i18n
  const { t, locale } = useTranslation();
  const tAdmin = <P extends Record<string, any> = Record<string, any>>(key: string, params?: P) =>
    t(`admin.members.detail.${key}`, params);
  const tCommon = <P extends Record<string, any> = Record<string, any>>(key: string, params?: P) =>
    t(`common.${key}`, params);

  const lang = (locale || "en").toLowerCase().startsWith("vi") ? "vi" : "en";

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserApi | null>(null);
  const [memberStats, setMemberStats] = useState<MemberStats | null>(null);
  const [statusSaving, setStatusSaving] = useState(false);

  const [txLoading, setTxLoading] = useState(false);
  const [txRows, setTxRows] = useState<Array<{
    id: string;
    type: "Earn" | "Redeem";
    description: string;
    miles: string;
    date: string;
    status: string;
  }>>([]);

  const dfFull = useMemo(
    () =>
      new Intl.DateTimeFormat(lang, {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    [lang]
  );

  const dfDate = useMemo(
    () =>
      new Intl.DateTimeFormat(lang, {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }),
    [lang]
  );

  /** ===== Fetch profile từ API ms-users ===== */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token") || "";
        const xUserId =
          localStorage.getItem("x-user-id") ||
          process.env.NEXT_PUBLIC_X_USER_ID ||
          "01f65a32-c45e-4042-b26e-b6127aaf98cc";

        const res = await callApi<any>({
          method: "GET",
          path: `/ms-users/admin/users/${encodeURIComponent(memberId)}`, // base của callApi là /api/v1
          headers: {
            Authorization: `Bearer ${token}`,
            "x-user-id": xUserId,
            accept: "application/json",
          },
        });

        const root = (res?.data ?? res) as any;
        if (root?.success === false) throw new Error("API success=false");

        const payload = unwrap(res);
        const user: UserApi | null = payload?.user ?? null;
        const stats: MemberStats | null = payload?.statistics ?? null;

        if (!cancelled) {
          setProfile(user);
          setMemberStats(stats);
        }
      } catch {
        if (!cancelled) {
          setProfile(null);
          setMemberStats(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [memberId]);

  /** ===== Fetch recent transactions (lọc theo user.id) ===== */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setTxLoading(true);
      try {
        const token = localStorage.getItem("token") || "";
        const res = await callApi<any>({
          method: "GET",
          path: `/ms-reward/admin/transactions?page=1&size=10`,
          headers: { Authorization: `Bearer ${token}` },
        });

        const payload = unwrap(res);
        const layer1 = payload?.data ?? payload;
        const list: TxApiItem[] =
          Array.isArray(layer1?.data) ? layer1.data
            : Array.isArray(layer1) ? layer1
            : Array.isArray(layer1?.data?.data) ? layer1.data.data
            : [];

        const filtered = list.filter(x => x.user?.id === memberId);

        const mapped = filtered.map((it) => {
          const pts = Number(it.points_used ?? 0);
          const type: "Earn" | "Redeem" = pts >= 0 ? "Earn" : "Redeem";
          const miles = `${pts >= 0 ? "+" : "-"}${Math.abs(pts).toLocaleString(lang)}`;
          const iso = it.transaction_date || it.created_at || "";
          return {
            id: it.id,
            type,
            description: it.description || "",
            miles,
            date: iso ? dfFull.format(new Date(iso)) : "",
            status: (it.status || "").toLowerCase(),
          };
        });

        if (!cancelled) setTxRows(mapped);
      } catch {
        if (!cancelled) setTxRows([]);
      } finally {
        if (!cancelled) setTxLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [memberId, lang, dfFull]);

  /** ====== Derived fields ====== */
  const name = useMemo(() => {
    const full = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ").trim();
    return full || profile?.user_name || "—";
  }, [profile]);

  const avatar = useMemo(() => {
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "NA";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }, [name]);

  const rawTier = (profile?.tier?.tier_name || "").trim();
  const tierLabel = useMemo(
    () => rawTier || tAdmin("tier.member"),
    [rawTier, t, locale]
  );

  const getTierColor = (tier: string) => {
    switch ((tier || "").toLowerCase()) {
      case "bronze": return "bg-purple-100 text-purple-700";
      case "gold": return "bg-yellow-100 text-yellow-700";
      case "silver": return "bg-gray-100 text-gray-700";
      case "platinum":
      case "diamond":
        return "bg-indigo-100 text-indigo-700";
      default: return "bg-blue-100 text-blue-700";
    }
  };

  const trStatus = (s?: string) => {
    const key = (s || "").toLowerCase();
    const translated = tAdmin(`status.${key}`);
    return translated === `admin.members.detail.status.${key}` ? (s || "—") : translated;
  };

  // Stats
  const totalEarned = memberStats
    ? memberStats.total_accumulated_points
    : txRows.filter(r => r.type === "Earn").reduce((s, r) => s + Number(r.miles.replace(/[^\d]/g, "")), 0);

  const totalBurned = memberStats
    ? memberStats.total_spent_points
    : txRows.filter(r => r.type === "Redeem").reduce((s, r) => s + Number(r.miles.replace(/[^\d]/g, "")), 0);

  const monthlyTx = memberStats?.monthly_transactions ?? txRows.length;

  const tenureMonths = useMemo(() => {
    if (memberStats?.membership_duration_days != null) {
      return Math.floor(memberStats.membership_duration_days / 30);
    }
    if (!profile?.created_at) return 0;
    const start = new Date(profile.created_at);
    const now = new Date();
    return Math.max(0, (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth()));
  }, [memberStats?.membership_duration_days, profile?.created_at]);

  const statTiles = useMemo(
    () => ([
      { title: tAdmin("stats.totalMiles"), value: totalEarned.toLocaleString(lang), icon: TrendingUp, color: "text-blue-600" },
      { title: tAdmin("stats.burnedMiles"), value: totalBurned.toLocaleString(lang), icon: Plane, color: "text-green-600" },
      { title: tAdmin("stats.monthlyTx"), value: monthlyTx.toLocaleString(lang), icon: Activity, color: "text-orange-600" },
      { title: tAdmin("stats.tenure"), value: tAdmin("stats.tenureValue", { months: tenureMonths }), icon: Calendar, color: "text-purple-600" },
    ]),
    [t, locale, lang, totalEarned, totalBurned, monthlyTx, tenureMonths]
  );

  // Account status
  const [isActive, setIsActive] = useState(true);
  useEffect(() => {
    setIsActive((profile?.status || "").toLowerCase() === "active");
  }, [profile?.status]);

  /** ===== Update status bằng callApi (optimistic + rollback) ===== */
  const handleStatusChange = async (checked: boolean) => {
    if (!memberId || statusSaving) return;

    const nextStatus = checked ? "active" : "inactive";
    const prev = isActive;

    // optimistic
    setIsActive(checked);
    setStatusSaving(true);

    try {
      const token = localStorage.getItem("token") || "";
      const xUserId =
        localStorage.getItem("x-user-id") ||
        process.env.NEXT_PUBLIC_X_USER_ID ||
        "01f65a32-c45e-4042-b26e-b6127aaf98cc";

      const res = await callApi<any>({
        method: "PUT",
        path: `/ms-users/admin/users/${encodeURIComponent(memberId)}`,
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
          Authorization: `Bearer ${token}`,
          "x-user-id": xUserId,
        },
        // hỗ trợ cả axios(data) lẫn fetch(body) theo wrapper hiện tại
        body: { status: nextStatus } as any,
      });

      // Nếu wrapper trả AxiosResponse: root = res.data
      // Nếu wrapper trả JSON đã bóc: root = res
      const root = (res?.data ?? res) as any;

      // Nếu API có field success và nó = false => coi là lỗi
      if (root?.success === false) throw new Error("API success=false");

      // Lấy user đã update từ payload (nếu có). Nếu không có thì vẫn set theo nextStatus.
      const updated = unwrap(res);
      const updatedStatus = updated?.status ?? updated?.data?.status ?? nextStatus;

      setProfile(p => (p ? { ...p, status: updatedStatus } : p));

      toast?.({
        title: "Updated",
        description: `User has been ${updatedStatus}.`,
      });
    } catch (e) {
      // rollback
      setIsActive(prev);
      toast?.({
        variant: "destructive",
        title: "Update failed",
        description: "Could not update user status. Please try again.",
      });
      console.error("Update status error:", e);
    } finally {
      setStatusSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center gap-2 text-muted-foreground">
        <Loader2 className="w-4 h-4 animate-spin" /> {tCommon("loading")}
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={16} />
          {tCommon("back")}
        </Button>
        <h1 className="text-2xl mb-2">{tAdmin("title")}</h1>
        <p className="text-gray-600">{tAdmin("subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                {tAdmin("section.personal")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-6">
                <Avatar className="w-20 h-20">
                  <AvatarFallback className="text-lg bg-blue-100 text-blue-600">
                    {avatar}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h2 className="text-xl font-semibold">{name}</h2>
                    <Badge className={getTierColor(rawTier)}>{tierLabel}</Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail size={16} className="text-gray-500" />
                      <span>{profile?.user_email || "—"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone size={16} className="text-gray-500" />
                      <span>{profile?.phone_numbers || "—"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-gray-500" />
                      <span>
                        {tAdmin("labels.dob")}:{" "}
                        {profile?.dob ? dfDate.format(new Date(profile.dob)) : "—"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-gray-500" />
                      <span>
                        {[profile?.address, profile?.ward, profile?.city, profile?.state].filter(Boolean).join(", ") || "—"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{tAdmin("labels.accountStatus")}</p>
                  <p className="text-sm text-gray-600">
                    {isActive ? tAdmin("account.activeText") : tAdmin("account.suspendedText")}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-medium ${isActive ? "text-green-700" : "text-gray-700"}`}>
                    {isActive ? tAdmin("account.active") : tAdmin("account.suspended")}
                  </span>
                  <Switch
                    checked={isActive}
                    onCheckedChange={handleStatusChange}
                    disabled={statusSaving}
                    className="data-[state=checked]:bg-blue-600"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle>{tAdmin("section.stats")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {statTiles.map((stat, i) => {
                  const Icon = stat.icon as any;
                  return (
                    <div key={i} className="text-center p-4 bg-gray-50 rounded-lg">
                      <Icon className={`w-8 h-8 mx-auto mb-2 ${stat.color}`} />
                      <p className="text-lg font-semibold">{stat.value}</p>
                      <p className="text-xs text-gray-600">{stat.title}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Recent transactions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-600" />
                {tAdmin("section.recentTx")}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {txLoading ? (
                <div className="p-4 text-muted-foreground flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> {tCommon("loading")}
                </div>
              ) : (
                <div className="space-y-0">
                  {txRows.map((transaction, index) => (
                    <div
                      key={transaction.id}
                      className={`p-4 ${index !== txRows.length - 1 ? "border-b" : ""} hover:bg-gray-50`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge
                              variant={transaction.type === "Earn" ? "default" : "secondary"}
                              className={transaction.type === "Earn" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}
                            >
                              {transaction.type === "Earn" ? tAdmin("tx.earnLabel") : tAdmin("tx.redeemLabel")}
                            </Badge>
                            <span className="text-sm text-gray-500">{transaction.date || "—"}</span>
                          </div>
                          <p className="font-medium">{transaction.description || "—"}</p>
                        </div>
                        <div className="text-right">
                          <p className={`font-semibold ${transaction.type === "Earn" ? "text-green-600" : "text-red-600"}`}>
                            {transaction.miles} {tCommon("miles")}
                          </p>
                          <p className="text-xs text-gray-500">{trStatus(transaction.status)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {txRows.length === 0 && (
                    <div className="p-4 text-muted-foreground">{tAdmin("tx.empty")}</div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{tAdmin("section.accountInfo")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">{tAdmin("labels.memberId")}</p>
                <p className="font-mono font-medium">{profile?.user_number || "—"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">{tAdmin("labels.joinDate")}</p>
                <p className="font-medium">
                  {profile?.created_at ? dfDate.format(new Date(profile.created_at)) : "—"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">{tAdmin("labels.lastActive")}</p>
                <p className="font-medium">
                  {profile?.updated_at ? dfDate.format(new Date(profile.updated_at)) : "—"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">{tAdmin("labels.tier")}</p>
                <Badge className={getTierColor(rawTier)}>{tierLabel}</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
