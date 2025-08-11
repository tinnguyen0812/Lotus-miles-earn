"use client";

import { useState } from "react";
import { useTranslation } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  User, Mail, Phone, MapPin, Calendar, Edit3, Shield,
} from "lucide-react";

export interface MemberInfo {
  name: string;
  email: string;
  membershipTier: "platinum" | "gold" | "silver" | "basic";
  totalMiles: number;
  milesThisYear: number;
  nextTierMiles: number;
}

export function AccountInfo({ memberInfo }: { memberInfo: MemberInfo }) {
  const { t, locale } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    name: memberInfo.name,
    phone: "+84 123 456 789",
    address: "123 Nguyen Hue, District 1, Ho Chi Minh City",
    dateOfBirth: "1990-01-15",
  });

  const tierCls: Record<MemberInfo["membershipTier"], string> = {
    platinum: "bg-gray-800 text-white",
    gold: "bg-yellow-500 text-white",
    silver: "bg-gray-400 text-white",
    basic: "bg-teal-600 text-white",
  };

  const benefitsKeys: Record<MemberInfo["membershipTier"], string[]> = {
    platinum: [
      "member.account.benefits.platinum.0",
      "member.account.benefits.platinum.1",
      "member.account.benefits.platinum.2",
      "member.account.benefits.platinum.3",
    ],
    gold: [
      "member.account.benefits.gold.0",
      "member.account.benefits.gold.1",
      "member.account.benefits.gold.2",
      "member.account.benefits.gold.3",
    ],
    silver: [
      "member.account.benefits.silver.0",
      "member.account.benefits.silver.1",
      "member.account.benefits.silver.2",
    ],
    basic: [
      "member.account.benefits.basic.0",
      "member.account.benefits.basic.1",
    ],
  };

  const fmtDate = (iso: string) =>
    new Intl.DateTimeFormat(locale ?? "en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(iso));

  const onChange = (k: keyof typeof form, v: string) =>
    setForm((p) => ({ ...p, [k]: v }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-teal-700 text-xl font-semibold">{t("member.account.title")}</h2>
        <p className="text-muted-foreground">{t("member.account.subtitle")}</p>
      </div>

      {/* Member status */}
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
                {(memberInfo.nextTierMiles - memberInfo.milesThisYear).toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground">
                {t("member.account.status.to_next")}
              </p>
            </div>
          </div>

          <div className="mt-6">
            <h4 className="mb-3 font-medium text-foreground">
              {t("member.account.benefits.title", {
                tier: t(`member.tier.${memberInfo.membershipTier}`),
              })}
            </h4>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              {benefitsKeys[memberInfo.membershipTier].map((k) => (
                <div key={k} className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-teal-600" />
                  <span className="text-sm text-foreground">{t(k)}</span>
                </div>
              ))}
            </div>
          </div>
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
            <div className="space-y-2">
              <Label htmlFor="name">{t("member.account.personal.name")}</Label>
              {isEditing ? (
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => onChange("name", e.target.value)}
                  className="border-teal-200 focus-visible:ring-teal-600"
                />
              ) : (
                <div className="flex items-center gap-2 rounded-md bg-gray-50 p-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{form.name}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="flex items-center gap-2 rounded-md bg-gray-50 p-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{memberInfo.email}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {t("member.account.personal.email_note")}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">{t("member.account.personal.phone")}</Label>
              {isEditing ? (
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={(e) => onChange("phone", e.target.value)}
                  className="border-teal-200 focus-visible:ring-teal-600"
                />
              ) : (
                <div className="flex items-center gap-2 rounded-md bg-gray-50 p-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{form.phone}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dob">{t("member.account.personal.dob")}</Label>
              {isEditing ? (
                <Input
                  id="dob"
                  type="date"
                  value={form.dateOfBirth}
                  onChange={(e) => onChange("dateOfBirth", e.target.value)}
                  className="border-teal-200 focus-visible:ring-teal-600"
                />
              ) : (
                <div className="flex items-center gap-2 rounded-md bg-gray-50 p-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{fmtDate(form.dateOfBirth)}</span>
                </div>
              )}
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="address">{t("member.account.personal.address")}</Label>
              {isEditing ? (
                <Input
                  id="address"
                  value={form.address}
                  onChange={(e) => onChange("address", e.target.value)}
                  className="border-teal-200 focus-visible:ring-teal-600"
                />
              ) : (
                <div className="flex items-center gap-2 rounded-md bg-gray-50 p-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{form.address}</span>
                </div>
              )}
            </div>
          </div>

          {isEditing && (
            <div className="mt-6 flex gap-3">
              <Button
                onClick={() => setIsEditing(false)}
                className="bg-teal-600 hover:bg-teal-700"
              >
                {t("common.save")}
              </Button>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                {t("common.cancel")}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security */}
      <Card className="border-teal-200">
        <CardHeader>
          <CardTitle className="text-teal-700">{t("member.account.security.title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
            <div>
              <h4 className="font-medium">{t("member.account.security.change_password.title")}</h4>
              <p className="text-sm text-muted-foreground">
                {t("member.account.security.change_password.subtitle")}
              </p>
            </div>
            <Button variant="outline" className="border-teal-600 text-teal-600 hover:bg-teal-50">
              {t("member.account.security.change_password.cta")}
            </Button>
          </div>

          <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
            <div>
              <h4 className="font-medium">{t("member.account.security.mfa.title")}</h4>
              <p className="text-sm text-muted-foreground">
                {t("member.account.security.mfa.subtitle")}
              </p>
            </div>
            <Button variant="outline" className="border-teal-600 text-teal-600 hover:bg-teal-50">
              {t("member.account.security.mfa.cta")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
