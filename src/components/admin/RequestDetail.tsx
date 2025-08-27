"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Download, UserRound, Plane, PlusCircle, Paperclip } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

export type ClaimStatus = "pending" | "processing" | "approved" | "rejected";

export interface RequestDetailData {
  id: string;
  submittedAt: string; // ISO
  status: ClaimStatus;
  expectedMiles: number;
  reason: string;

  member: {
    initials: string;
    fullName: string;
    memberCode: string;
    email: string;
    phone: string;
    tier: string;           // e.g. Gold
    tenureMonths: number;   // e.g. 24
    totalMiles: number;     // accumulated miles
  };

  flight?: {
    number: string;     // VN125
    date: string;       // ISO
    routeFrom: string;  // SGN
    routeTo: string;    // HAN
    cabin: string;      // Business
    distanceKm?: number;
  };

  attachments: Array<{
    id: string;
    name: string;
    sizeBytes: number;
    url: string;        // direct or signed URL
  }>;
}

export function RequestDetail({
  data,
  onApprove,
  onReject
}: {
  data: RequestDetailData;
  onApprove: () => Promise<void> | void;
  onReject: (reason: string) => Promise<void> | void;
}) {
  const { t, locale } = useTranslation();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString(locale === "vi" ? "vi-VN" : "en-US", {
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit"
    });

  const formatMiles = (m: number) =>
    `${m.toLocaleString(locale === "vi" ? "vi-VN" : "en-US")} ${t("admin.claims.detail.milesUnit")}`;

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  const statusTone: Record<ClaimStatus, string> = {
    pending: "bg-orange-100 text-orange-700",
    processing: "bg-blue-100 text-blue-700",
    approved: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
  };

  return (
    <div className="space-y-6">
      {/* Title + status */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">
            {t("admin.claims.detail.title", { id: data.id })}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("admin.claims.detail.submittedAt")} {formatDate(data.submittedAt)}
          </p>
        </div>
        <Badge className={statusTone[data.status]}>
          {t(`admin.claims.status.${data.status}`)}
        </Badge>
      </div>

      {/* 3-column summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <UserRound className="h-4 w-4 text-primary" />
              {t("admin.claims.detail.memberInfo")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="rounded-full bg-teal-50 text-teal-700 w-10 h-10 grid place-items-center font-medium">
              {data.member.initials}
            </div>
            <div className="grid grid-cols-2 gap-y-2 text-sm">
              <div className="text-muted-foreground">{t("admin.claims.detail.fullName")}</div>
              <div>{data.member.fullName}</div>

              <div className="text-muted-foreground">{t("admin.claims.detail.memberCode")}</div>
              <div>{data.member.memberCode}</div>

              <div className="text-muted-foreground">Email</div>
              <div>{data.member.email}</div>

              <div className="text-muted-foreground">{t("admin.claims.detail.phone")}</div>
              <div>{data.member.phone}</div>

              <div className="text-muted-foreground">{t("admin.claims.detail.tier")}</div>
              <div>{data.member.tier}</div>

              <div className="text-muted-foreground">{t("admin.claims.detail.tenure")}</div>
              <div>{t("admin.claims.detail.tenureValue", { months: data.member.tenureMonths })}</div>

              <div className="text-muted-foreground">{t("admin.claims.detail.totalMiles")}</div>
              <div>{data.member.totalMiles.toLocaleString()}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Plane className="h-4 w-4 text-primary" />
              {t("admin.claims.detail.flightInfo")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {data.flight ? (
              <div className="grid grid-cols-2 gap-y-2">
                <div className="text-muted-foreground">{t("admin.claims.detail.flightNo")}</div>
                <div>{data.flight.number}</div>

                <div className="text-muted-foreground">{t("admin.claims.detail.flightDate")}</div>
                <div>{new Date(data.flight.date).toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US")}</div>

                <div className="text-muted-foreground">{t("admin.claims.detail.route")}</div>
                <div>{data.flight.routeFrom} — {data.flight.routeTo}</div>

                <div className="text-muted-foreground">{t("admin.claims.detail.cabin")}</div>
                <div>{data.flight.cabin}</div>

                <div className="text-muted-foreground">{t("admin.claims.detail.distance")}</div>
                <div>{data.flight.distanceKm ? `${data.flight.distanceKm} km` : "-"}</div>
              </div>
            ) : (
              <p className="text-muted-foreground">{t("admin.claims.detail.noFlightInfo")}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <PlusCircle className="h-4 w-4 text-primary" />
              {t("admin.claims.detail.creditMiles")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-2xl font-semibold text-emerald-700">
              +{formatMiles(data.expectedMiles)}
            </div>
            <Separator />
            <div>
              <p className="text-sm font-medium mb-2">{t("admin.claims.detail.requestReason")}</p>
              <div className="rounded-md border bg-muted/40 p-3 text-sm leading-relaxed">
                {data.reason}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attachments */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Paperclip className="h-4 w-4 text-primary" />
            {t("admin.claims.detail.attachments")} ({data.attachments.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.attachments.map(file => (
            <div
              key={file.id}
              className="flex items-center justify-between rounded-md border p-3 bg-muted/30 w-full"
            >
              <div className="min-w-0"> {/* giữ text không tràn */}
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">{formatSize(file.sizeBytes)}</p>
              </div>
              <a
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-primary hover:underline flex-shrink-0"
              >
                <Download className="h-4 w-4" />
                {t("admin.claims.detail.download")}
              </a>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Actions */}
      {!(data.status === "approved" || data.status === "rejected") && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button className="h-11 text-base" onClick={onApprove}>
            {t("admin.claims.detail.actions.approve")}
          </Button>
          <Button
            variant="destructive"
            className="h-11 text-base"
            onClick={() => setRejectOpen(true)}
          >
            {t("admin.claims.detail.actions.reject")}
          </Button>
        </div>
      )}

      {/* Reject dialog */}
      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("admin.claims.detail.rejectDialog.title")}</DialogTitle>
          </DialogHeader>
          <Textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder={t("admin.claims.detail.rejectDialog.placeholder") || ""}
            className="min-h-[120px]"
          />
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setRejectOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                await onReject(rejectReason);
                setRejectOpen(false);
                setRejectReason("");
              }}
              disabled={!rejectReason.trim()}
            >
              {t("admin.claims.detail.rejectDialog.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
