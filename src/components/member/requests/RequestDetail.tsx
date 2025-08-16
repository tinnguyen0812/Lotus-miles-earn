"use client";

import {
  ArrowLeft,
  FileText,
  Download,
  Calendar,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useTranslation } from "@/lib/i18n";
import * as React from "react";

export type RequestAttachment = {
  id: string | number;
  name: string;
  size?: string;
  url?: string; // optional download URL
  type?: string;
};

export type RequestDetailData = {
  id: string;
  status: "pending" | "processing" | "approved" | "rejected";
  type: string; // already localized from API or map it before passing
  description: string;
  submissionDate: string; // ISO string
  expectedMiles: number;
  actualMiles?: number | null;
  rejectionReason?: string | null;
  adminNote?: string | null;
  details: Record<string, string | number>;
  attachments: RequestAttachment[];
};

interface RequestDetailProps {
  data: RequestDetailData;
  onBack: () => void;
  contactEmail?: string;
}

export default function RequestDetail({
  data,
  onBack,
  contactEmail = "support@example.com",
}: RequestDetailProps) {
  const { t, locale } = useTranslation();

  const nf = React.useMemo(
    () => new Intl.NumberFormat(locale || "en"),
    [locale]
  );
  const df = React.useMemo(
    () =>
      new Intl.DateTimeFormat(locale || "en", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }),
    [locale]
  );

  const statusCfg = getStatusConfig(t, data.status);
  const StatusIcon = statusCfg.icon;

  const fieldLabel = (key: string) => {
    // Map known keys to i18n labels; fallback to humanized key
    const map: Record<string, string> = {
      flightNumber: t("member.requestDetail.fields.flightNumber"),
      departureDate: t("member.requestDetail.fields.departureDate"),
      arrivalDate: t("member.requestDetail.fields.arrivalDate"),
      bookingReference: t("member.requestDetail.fields.bookingReference"),
      merchant: t("member.requestDetail.fields.merchant"),
      transactionDate: t("member.requestDetail.fields.transactionDate"),
      amount: t("member.requestDetail.fields.amount"),
      receiptNumber: t("member.requestDetail.fields.receiptNumber"),
      hotelName: t("member.requestDetail.fields.hotelName"),
      checkInDate: t("member.requestDetail.fields.checkInDate"),
      checkOutDate: t("member.requestDetail.fields.checkOutDate"),
    };
    if (map[key]) return map[key];
    // fallback: prettify camelCase to words
    return key.replace(/([A-Z])/g, " $1").replace(/^./, (m) => m.toUpperCase());
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={onBack}
          className="border-teal-600 text-teal-600 hover:bg-teal-50"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t("member.requestDetail.actions.backToList")}
        </Button>
        <div>
          <h1 className="text-3xl text-teal-600">
            {t("member.requestDetail.title", { id: data.id })}
          </h1>
          <p className="text-gray-600 mt-1">
            {t("member.requestDetail.subtitle")}
          </p>
        </div>
      </div>

      {/* Status overview (yellow/green/red band) */}
      <Card className={`${statusCfg.bgColor} ${statusCfg.borderColor} border-2`}>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-white">
              <StatusIcon className={`w-6 h-6 ${statusCfg.textColor}`} />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <Badge variant={statusCfg.variant} className="text-sm px-3 py-1">
                  {statusCfg.label}
                </Badge>
                <span className="text-sm text-gray-600">
                  {t("member.requestDetail.submittedOn", {
                    date: df.format(new Date(data.submissionDate)),
                  })}
                </span>
              </div>

              <p className={`mt-2 ${statusCfg.textColor}`}>
                {data.status === "pending" || data.status === "processing"
                  ? t("member.requestDetail.statusMsg.processing")
                  : data.status === "approved"
                  ? t("member.requestDetail.statusMsg.approved", {
                      miles: nf.format(data.actualMiles ?? 0),
                    })
                  : t("member.requestDetail.statusMsg.rejected")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Request info */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-teal-600">
              <CreditCard className="w-5 h-5" />
              {t("member.requestDetail.info.title")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-gray-600">
                {t("member.requestDetail.info.type")}
              </label>
              <p className="mt-1">{data.type}</p>
            </div>
            <Separator />
            <div>
              <label className="text-sm text-gray-600">
                {t("member.requestDetail.info.description")}
              </label>
              <p className="mt-1">{data.description}</p>
            </div>
            <Separator />

            {/* dynamic fields */}
            {Object.entries(data.details ?? {}).map(([k, v]) => (
              <div key={k}>
                <label className="text-sm text-gray-600">{fieldLabel(k)}</label>
                <p className="mt-1">
                  {String(
                    /date/i.test(k) ? df.format(new Date(String(v))) : v
                  )}
                </p>
              </div>
            ))}

            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">
                {t("member.requestDetail.info.expectedMiles")}
              </span>
              <span className="text-lg text-teal-600">
                {nf.format(data.expectedMiles)} {t("common.miles")}
              </span>
            </div>

            {!!data.actualMiles && (
              <>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    {t("member.requestDetail.info.actualMiles")}
                  </span>
                  <span className="text-lg text-green-600">
                    {nf.format(data.actualMiles)} {t("common.miles")}
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Right: System feedback */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-teal-600">
              <Calendar className="w-5 h-5" />
              {t("member.requestDetail.feedback.title")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {(data.status === "pending" || data.status === "processing") && (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  {t("member.requestDetail.feedback.processing")}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  {t("member.requestDetail.feedback.sla")}
                </p>
              </div>
            )}

            {data.status === "approved" && !!data.adminNote && (
              <div>
                <label className="text-sm text-gray-600">
                  {t("member.requestDetail.feedback.adminNote")}
                </label>
                <div className="mt-2 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800">{data.adminNote}</p>
                </div>
              </div>
            )}

            {data.status === "rejected" && !!data.rejectionReason && (
              <div>
                <label className="text-sm text-gray-600">
                  {t("member.requestDetail.feedback.rejectionReason")}
                </label>
                <div className="mt-2 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800">{data.rejectionReason}</p>
                </div>
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-blue-800 text-sm">
                    {t("member.requestDetail.feedback.rejectionHint")}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Attachments */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-teal-600">
            <FileText className="w-5 h-5" />
            {t("member.requestDetail.attachments.title", {
              count: data.attachments?.length ?? 0,
            })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(data.attachments ?? []).map((att) => (
              <div
                key={att.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-teal-100 rounded-lg">
                    <FileText className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{att.name}</p>
                    {!!att.size && (
                      <p className="text-sm text-gray-500">{att.size}</p>
                    )}
                  </div>
                </div>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="border-teal-600 text-teal-600 hover:bg-teal-50"
                  disabled={!att.url}
                >
                  <a href={att.url || "#"} target="_blank" rel="noreferrer">
                    <Download className="w-4 h-4" />
                  </a>
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Footer actions */}
      <div className="flex justify-center gap-4 pt-6">
        <Button
          variant="outline"
          onClick={onBack}
          className="border-teal-600 text-teal-600 hover:bg-teal-50"
        >
          {t("member.requestDetail.actions.backToList")}
        </Button>
        <Button
          onClick={() => (window.location.href = `mailto:${contactEmail}`)}
          className="bg-teal-600 hover:bg-teal-700 text-white"
        >
          {t("member.requestDetail.actions.contactSupport")}
        </Button>
      </div>
    </div>
  );
}

/* -------- helpers -------- */
function getStatusConfig(
  t: (k: string, o?: any) => string,
  status: RequestDetailData["status"]
) {
  switch (status) {
    case "pending":
      return {
        label: t("member.requestDetail.status.pending"),
        variant: "secondary" as const,
        bgColor: "bg-yellow-50",
        textColor: "text-yellow-700",
        borderColor: "border-yellow-200",
        icon: Clock,
  };
    case "processing":
      return {
        label: t("member.requestDetail.status.processing"),
        variant: "secondary" as const,
        bgColor: "bg-yellow-50",
        textColor: "text-yellow-700",
        borderColor: "border-yellow-200",
        icon: Clock,
      };
    case "approved":
      return {
        label: t("member.requestDetail.status.approved"),
        variant: "default" as const,
        bgColor: "bg-green-50",
        textColor: "text-green-700",
        borderColor: "border-green-200",
        icon: CheckCircle,
      };
    case "rejected":
      return {
        label: t("member.requestDetail.status.rejected"),
        variant: "destructive" as const,
        bgColor: "bg-red-50",
        textColor: "text-red-700",
        borderColor: "border-red-200",
        icon: AlertCircle,
      };
    default:
      return {
        label: t("member.requestDetail.status.unknown"),
        variant: "secondary" as const,
        bgColor: "bg-gray-50",
        textColor: "text-gray-700",
        borderColor: "border-gray-200",
        icon: Clock,
      };
  }
}
