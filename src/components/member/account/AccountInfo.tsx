"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { callApi } from "@/lib/api-client";
import {
  User, Mail, Phone, MapPin, Calendar, Edit3, Shield,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export interface MemberInfo {
  name: string;
  email: string;
  membershipTier: "platinum" | "gold" | "silver" | "bronze" | "member";
  totalMiles: number;
  milesThisYear: number;
  /** số điểm còn thiếu để lên bậc kế tiếp (đã tính sẵn) */
  nextTierMiles: number;

  // profile fields
  phoneNumber: string;
  dob: string;
  address: string;
  city: string;     // (VN: Tỉnh/Thành)
  state: string;    // (quốc gia khác dùng "state"; VN có thể để trống)
  zip: string;
  country: string;
  district?: string; // (VN: Quận/Huyện/TP Thủ Đức…)
  ward?: string;     // (VN: Phường/Xã)
}

type BenefitLine = string;

type Province = { code: number; name: string; codename: string };
type District = { code: number; name: string; codename: string; province_code: number };
type Ward = { code: number; name: string; codename: string; district_code: number };

function splitName(full: string) {
  const parts = (full || "").trim().split(/\s+/);
  if (parts.length === 0) return { first_name: "", last_name: "" };
  if (parts.length === 1) return { first_name: parts[0], last_name: "" };
  return { first_name: parts[0], last_name: parts.slice(1).join(" ") };
}
const same = (a: any, b: any) => String(a ?? "") === String(b ?? "");

export function AccountInfo({
  memberInfo,
  benefits = [],
  onProfileUpdated
}: {
  memberInfo: MemberInfo;
  benefits?: BenefitLine[];
  onProfileUpdated?: () => Promise<void>;
}) {
  const { t, locale } = useTranslation();
  const { toast } = useToast();

  // ----- VIEW STATE -----
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // ----- FORM STATE -----
  const [name, setName] = useState(memberInfo.name);
  const [phone, setPhone] = useState(memberInfo.phoneNumber || "");
  const [dob, setDob] = useState((memberInfo.dob || "").slice(0, 10));
  const [street, setStreet] = useState(memberInfo.address || "");
  const [zip, setZip] = useState(memberInfo.zip || "");
  const [country, setCountry] = useState(memberInfo.country || "Vietnam");

  // các field text để dùng cho non-VN và hiển thị
  const [cityText, setCityText] = useState(memberInfo.city || "");
  const [stateText, setStateText] = useState(memberInfo.state || "");
  const [districtText, setDistrictText] = useState(memberInfo.district || "");
  const [wardText, setWardText] = useState(memberInfo.ward || "");

  // VN cascading selects
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [provinceCode, setProvinceCode] = useState<number | "">("");
  const [districtCode, setDistrictCode] = useState<number | "">("");
  const [wardCode, setWardCode] = useState<number | "">("");

  const isVN = (country || "").toLowerCase().includes("viet");

  // preselect theo profile (best-effort match theo name)
  useEffect(() => {
    if (!isVN) return;
    let cancel = false;
    (async () => {
      try {
        const res = await fetch("https://provinces.open-api.vn/api/?depth=1");
        const data: Province[] = await res.json();
        if (cancel) return;
        setProvinces(data);

        const pv = data.find(p => p.name.toLowerCase() === (memberInfo.city || "").toLowerCase());
        if (pv) setProvinceCode(pv.code);
      } catch { }
    })();
    return () => { cancel = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVN]);

  useEffect(() => {
    if (!isVN) return;
    if (!provinceCode) {
      setDistricts([]); setDistrictCode(""); setWards([]); setWardCode("");
      return;
    }
    let cancel = false;
    (async () => {
      try {
        const res = await fetch(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`);
        const data = await res.json();
        const ds: District[] = (data?.districts || []).map((d: any) => ({
          code: d.code, name: d.name, codename: d.codename, province_code: d.province_code,
        }));
        if (cancel) return;
        setDistricts(ds);
        const dMatch = ds.find(d =>
          d.name.toLowerCase() ===
          ((memberInfo.district || memberInfo.state || "").toLowerCase())
        );
        if (dMatch) setDistrictCode(dMatch.code);
      } catch { }
    })();
    return () => { cancel = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provinceCode, isVN]);

  useEffect(() => {
    if (!isVN) return;
    if (!districtCode) { setWards([]); setWardCode(""); return; }
    let cancel = false;
    (async () => {
      try {
        const res = await fetch(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`);
        const data = await res.json();
        const ws: Ward[] = (data?.wards || []).map((w: any) => ({
          code: w.code, name: w.name, codename: w.codename, district_code: w.district_code,
        }));
        if (cancel) return;
        setWards(ws);
        const normalize = (s: string) => s.trim().toLowerCase();
        const wMatch = ws.find(w => normalize(w.name) === normalize(memberInfo.ward || ""));
        if (wMatch) setWardCode(wMatch.code);
      } catch { }
    })();
    return () => { cancel = true; };
  }, [districtCode, isVN, memberInfo.ward]);

  const selectedProvince = useMemo(
    () => provinces.find(p => p.code === provinceCode),
    [provinces, provinceCode]
  );
  const selectedDistrict = useMemo(
    () => districts.find(d => d.code === districtCode),
    [districts, districtCode]
  );
  const selectedWard = useMemo(
    () => wards.find(w => w.code === wardCode),
    [wards, wardCode]
  );

  // ----- UI helpers -----
  const fmtDate = (iso: string) =>
    new Intl.DateTimeFormat(locale ?? "en-US", {
      day: "2-digit", month: "2-digit", year: "numeric",
    }).format(new Date(iso));

  const tierCls: Record<MemberInfo["membershipTier"], string> = {
    platinum: "bg-gray-800 text-white",
    gold: "bg-yellow-500 text-white",
    silver: "bg-gray-400 text-white",
    bronze: "bg-amber-700 text-white",
    member: "bg-teal-600 text-white",
  };

  // Địa chỉ hiển thị đầy đủ (view mode)
  const composedAddress = useMemo(() => {
    const ward = isVN ? (selectedWard?.name || memberInfo.ward || wardText) : (wardText || memberInfo.ward);
    const district = isVN ? (selectedDistrict?.name || memberInfo.district || memberInfo.state || districtText)
      : (districtText || memberInfo.district || memberInfo.state);
    const city = isVN ? (selectedProvince?.name || memberInfo.city || cityText)
      : (cityText || memberInfo.city);
    const parts = [
      street || memberInfo.address,
      ward, district, city,
      country || memberInfo.country,
    ].filter(Boolean);
    return parts.join(", ");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [street, zip, country, selectedWard, selectedDistrict, selectedProvince, wardText, districtText, cityText, stateText, memberInfo, isVN]);

  // ----- SAVE -----
  async function onSave() {
    // build proposed new values: ưu tiên select VN; nếu không, lấy text
    const { first_name, last_name } = splitName(name);
    const cityName = isVN ? (selectedProvince?.name || memberInfo.city || "") : (cityText || memberInfo.city || "");
    const districtName = isVN ? (selectedDistrict?.name || memberInfo.district || memberInfo.state || "")
      : (districtText || memberInfo.district || "");
    const wardName = isVN ? (selectedWard?.name || memberInfo.ward || "")
      : (wardText || memberInfo.ward || "");
    const stateName = isVN ? (memberInfo.state || stateText || "") : (stateText || memberInfo.state || "");

    const payload: any = {};
    if (!same(first_name, splitName(memberInfo.name).first_name)) payload.first_name = first_name;
    if (!same(last_name, splitName(memberInfo.name).last_name)) payload.last_name = last_name;
    if (!same(phone, memberInfo.phoneNumber)) payload.phone_numbers = phone;
    if (!same(dob, memberInfo.dob)) payload.dob = dob;
    if (!same(street, memberInfo.address)) payload.address = street;
    if (!same(cityName, memberInfo.city)) payload.city = cityName;
    if (!same(stateName, memberInfo.state)) payload.state = stateName;
    if (!same(districtName, memberInfo.district)) payload.district = districtName;
    if (!same(wardName, memberInfo.ward)) payload.ward = wardName;
    if (!same(zip, memberInfo.zip)) payload.zip = zip;
    if (!same(country, memberInfo.country)) payload.country = country;

    if (Object.keys(payload).length === 0) {
      toast({ title: t("common.nothing_changed") || "Nothing changed" });
      setIsEditing(false);
      return;
    }

    const token = localStorage.getItem("token") || "";
    const userId = localStorage.getItem("user_id") || localStorage.getItem("userId") || "";

    try {
      setSaving(true);
      await callApi({
        method: "PUT",
        path: "/ms-users/member/profile",
        body: payload,
        headers: {
          Authorization: `Bearer ${token}`,
          "x-user-id": userId,
        },
      });
      if (onProfileUpdated) {
        await onProfileUpdated();
      }
      setIsEditing(false);
      toast({ title: t("common.saved") || "Saved" });

    } catch (e: any) {
      toast({
        title: t("common.error") || "Error",
        description: e?.message || "Update failed",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-teal-700 text-xl font-semibold">{t("member.account.title")}</h2>
        <p className="text-muted-foreground">{t("member.account.subtitle")}</p>
      </div>

      {/* Membership status */}
      <Card className="border-teal-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-teal-700">
              {t("member.account.status.title")}
            </CardTitle>
            <Badge className={tierCls[memberInfo.membershipTier]}>
              {t(`member.tier.${memberInfo.membershipTier}`)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-teal-700">
                {memberInfo.totalMiles.toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground">
                {t("member.account.status.total")}
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-teal-700">
                {memberInfo.milesThisYear.toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground">
                {t("member.account.status.this_year")}
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {memberInfo.nextTierMiles.toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground">
                {t("member.account.status.to_next")}
              </p>
            </div>
          </div>

          {benefits?.length > 0 && (
            <div className="mt-6">
              <h4 className="mb-3 font-medium text-foreground">
                {t("member.account.benefits.title", {
                  tier: t(`member.tier.${memberInfo.membershipTier}`),
                })}
              </h4>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                {benefits.map((line, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-teal-600 flex-shrink-0" />
                    <span className="text-sm text-foreground">{line}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Personal info */}
      <Card className="border-teal-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-teal-700">{t("member.account.personal.title")}</CardTitle>
            <Button
              variant="outline"
              size="sm"
              className="border-teal-600 text-teal-600 hover:bg-teal-50"
              onClick={() => setIsEditing((s) => !s)}
            >
              <Edit3 className="mr-2 h-4 w-4" />
              {isEditing ? t("common.cancel") : t("common.edit")}
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">{t("member.account.personal.name")}</Label>
              {isEditing ? (
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="border-teal-200 focus-visible:ring-teal-600"
                />
              ) : (
                <div className="flex items-center gap-2 rounded-md bg-gray-50 p-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{name}</span>
                </div>
              )}
            </div>

            {/* Email (readonly) */}
            <div className="space-y-2">
              <Label>Email</Label>
              <div className="flex items-center gap-2 rounded-md bg-gray-50 p-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{memberInfo.email}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {t("member.account.personal.email_note")}
              </p>
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">{t("member.account.personal.phone")}</Label>
              {isEditing ? (
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="border-teal-200 focus-visible:ring-teal-600"
                />
              ) : (
                <div className="flex items-center gap-2 rounded-md bg-gray-50 p-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{phone}</span>
                </div>
              )}
            </div>

            {/* DOB */}
            <div className="space-y-2">
              <Label htmlFor="dob">{t("member.account.personal.dob")}</Label>
              {isEditing ? (
                <Input
                  id="dob"
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="border-teal-200 focus-visible:ring-teal-600"
                />
              ) : (
                <div className="flex items-center gap-2 rounded-md bg-gray-50 p-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{dob ? fmtDate(dob) : "-"}</span>
                </div>
              )}
            </div>

            {/* Street */}
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="street">{t("member.account.personal.address")}</Label>
              {isEditing ? (
                <Input
                  id="street"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="e.g. 123 Nguyen Hue"
                  className="border-teal-200 focus-visible:ring-teal-600"
                />
              ) : (
                <div className="flex items-center gap-2 rounded-md bg-gray-50 p-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{memberInfo.address || "-"}</span>
                </div>
              )}
            </div>

            {/* Country */}
            <div className="space-y-2">
              <Label>{t("member.account.personal.country") || "Country"}</Label>
              {isEditing ? (
                <Input
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="border-teal-200 focus-visible:ring-teal-600"
                />
              ) : (
                <div className="rounded-md bg-gray-50 p-3">{country || "-"}</div>
              )}
            </div>

            {/* ZIP */}
            <div className="space-y-2">
              <Label>ZIP</Label>
              {isEditing ? (
                <Input
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                  className="border-teal-200 focus-visible:ring-teal-600"
                />
              ) : (
                <div className="rounded-md bg-gray-50 p-3">{zip || "-"}</div>
              )}
            </div>

            {/* City / State / District / Ward – hiển thị ở view mode */}
            {!isEditing && (
              <>
                <div className="space-y-2">
                  <Label>{t("member.account.personal.city") || "City / Province"}</Label>
                  <div className="rounded-md bg-gray-50 p-3">
                    {memberInfo.city || "-"}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{t("member.account.personal.district") || "District"}</Label>
                  <div className="rounded-md bg-gray-50 p-3">
                    {memberInfo.district || memberInfo.state || "-"}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{t("member.account.personal.ward") || "Ward"}</Label>
                  <div className="rounded-md bg-gray-50 p-3">
                    {memberInfo.ward || "-"}
                  </div>
                </div>
              </>
            )}

            {/* Province / District / Ward – chỉ bật khi country là Vietnam */}
            {isEditing && isVN && (
              <>
                <div className="space-y-2">
                  <Label>City / Province</Label>
                  <select
                    className="w-full rounded-md border border-teal-200 p-2"
                    value={provinceCode}
                    onChange={(e) =>
                      setProvinceCode(e.target.value ? Number(e.target.value) : "")
                    }
                  >
                    <option value="">{t("common.select")}</option>
                    {provinces.map((p) => (
                      <option key={p.code} value={p.code}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>District</Label>
                  <select
                    className="w-full rounded-md border border-teal-200 p-2"
                    value={districtCode}
                    onChange={(e) =>
                      setDistrictCode(e.target.value ? Number(e.target.value) : "")
                    }
                    disabled={!provinceCode}
                  >
                    <option value="">{t("common.select")}</option>
                    {districts.map((d) => (
                      <option key={d.code} value={d.code}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>Ward</Label>
                  <select
                    className="w-full rounded-md border border-teal-200 p-2"
                    value={wardCode}
                    onChange={(e) =>
                      setWardCode(e.target.value ? Number(e.target.value) : "")
                    }
                    disabled={!districtCode}
                  >
                    <option value="">{t("common.select")}</option>
                    {wards.map((w) => (
                      <option key={w.code} value={w.code}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {/* Nếu KHÔNG phải VN mà đang edit → text inputs cho City/State/District/Ward */}
            {isEditing && !isVN && (
              <>
                <div className="space-y-2">
                  <Label>{t("member.account.personal.city") || "City / Province"}</Label>
                  <Input
                    value={cityText}
                    onChange={(e) => setCityText(e.target.value)}
                    className="border-teal-200 focus-visible:ring-teal-600"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("member.account.personal.district") || "District"}</Label>
                  <Input
                    value={districtText}
                    onChange={(e) => setDistrictText(e.target.value)}
                    className="border-teal-200 focus-visible:ring-teal-600"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("member.account.personal.ward") || "Ward"}</Label>
                  <Input
                    value={wardText}
                    onChange={(e) => setWardText(e.target.value)}
                    className="border-teal-200 focus-visible:ring-teal-600"
                  />
                </div>
              </>
            )}
          </div>

          {isEditing && (
            <div className="mt-6 flex gap-3">
              <Button
                onClick={onSave}
                disabled={saving}
                className="bg-teal-600 hover:bg-teal-700"
              >
                {saving ? t("common.saving") || "Saving..." : t("common.save")}
              </Button>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                {t("common.cancel")}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
