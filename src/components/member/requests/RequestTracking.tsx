"use client";

import { useMemo } from "react";
import { useTranslation } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Eye, Calendar, FileText, CheckCircle, Clock, XCircle,
} from "lucide-react";
import Link from "next/link";
export type RequestStatus = "pending" | "processing" | "approved" | "rejected";

export interface MilesRequest {
    id: string;
    type: "missing-flight" | "partner-purchase" | "hotel-stay" | "credit-card" | "other";
    description: string;
    submittedDate: string; // ISO
    status: RequestStatus;
    expectedMiles: number;
    actualMiles?: number;
    rejectionReason?: string;
    processingNotes?: string;
}

const mockRequests: MilesRequest[] = [
    {
        id: "REQ-2025-001",
        type: "missing-flight",
        description: "SGN → NRT (VN301) • 15/07/2025",
        submittedDate: "2025-08-03",
        status: "processing",
        expectedMiles: 2500,
        processingNotes: "Verifying with airline",
    },
    {
        id: "REQ-2025-002",
        type: "partner-purchase",
        description: "Vincom Center • invoice #VIN789012",
        submittedDate: "2025-07-28",
        status: "approved",
        expectedMiles: 800,
        actualMiles: 800,
    },
    {
        id: "REQ-2025-003",
        type: "hotel-stay",
        description: "Sheraton Hanoi • 3 nights",
        submittedDate: "2025-07-20",
        status: "rejected",
        expectedMiles: 1200,
        rejectionReason: "Booking not found in partner system",
    },
    {
        id: "REQ-2025-004",
        type: "credit-card",
        description: "VietinBank card payment • 06/2025",
        submittedDate: "2025-07-15",
        status: "approved",
        expectedMiles: 1500,
        actualMiles: 1350,
    },
];

export function RequestTracking() {
    const { t, locale } = useTranslation();

    const fmtDate = (iso: string) =>
        new Intl.DateTimeFormat(locale ?? "en-US", { day: "2-digit", month: "2-digit", year: "numeric" })
            .format(new Date(iso));

    const statusIcon = (s: RequestStatus) => {
        switch (s) {
            case "pending": return <Clock className="h-4 w-4 text-orange-500" />;
            case "processing": return <Clock className="h-4 w-4 text-blue-500" />;
            case "approved": return <CheckCircle className="h-4 w-4 text-green-600" />;
            case "rejected": return <XCircle className="h-4 w-4 text-red-500" />;
        }
    };

    const statusBadge = (s: RequestStatus) => {
        const map: Record<RequestStatus, string> = {
            pending: "member.requests.status.pending",
            processing: "member.requests.status.processing",
            approved: "member.requests.status.approved",
            rejected: "member.requests.status.rejected",
        };
        const cls: Record<RequestStatus, string> = {
            pending: "bg-orange-100 text-orange-800",
            processing: "bg-blue-100 text-blue-800",
            approved: "bg-green-100 text-green-800",
            rejected: "bg-red-100 text-red-800",
        };
        return <Badge className={cls[s]}>{t(map[s])}</Badge>;
    };

    const typeLabel = (type: MilesRequest["type"]) =>
        t(`member.requests.type.${type}`);

    const summary = useMemo(() => {
        const counts = {
            pending: mockRequests.filter(r => r.status === "pending").length,
            processing: mockRequests.filter(r => r.status === "processing").length,
            approved: mockRequests.filter(r => r.status === "approved").length,
            rejected: mockRequests.filter(r => r.status === "rejected").length,
        };
        return counts;
    }, []);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-teal-700 text-xl font-semibold">{t("member.requests.title")}</h2>
                    <p className="text-muted-foreground">{t("member.requests.subtitle")}</p>
                </div>
                <Button className="bg-teal-600 hover:bg-teal-700">
                    <Link href="/member/claim-miles">
                        {t("member.requests.create")}
                    </Link>
                </Button>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-orange-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">{t("member.requests.status.pending")}</p>
                                <p className="text-2xl font-bold text-orange-600">{summary.pending}</p>
                            </div>
                            <Clock className="h-8 w-8 text-orange-200" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-blue-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">{t("member.requests.status.processing")}</p>
                                <p className="text-2xl font-bold text-blue-600">{summary.processing}</p>
                            </div>
                            <Clock className="h-8 w-8 text-blue-200" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-green-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">{t("member.requests.status.approved")}</p>
                                <p className="text-2xl font-bold text-green-600">{summary.approved}</p>
                            </div>
                            <CheckCircle className="h-8 w-8 text-green-200" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-red-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">{t("member.requests.status.rejected")}</p>
                                <p className="text-2xl font-bold text-red-600">{summary.rejected}</p>
                            </div>
                            <XCircle className="h-8 w-8 text-red-200" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Requests list */}
            <div className="space-y-4">
                {mockRequests.map((req) => (
                    <Card key={req.id} className="border-teal-200">
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="mb-2 flex items-center gap-3">
                                        {statusIcon(req.status)}
                                        <h3 className="font-medium text-teal-700">{req.id}</h3>
                                        {statusBadge(req.status)}
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <FileText className="h-4 w-4" />
                                            <span>{typeLabel(req.type)}</span>
                                        </div>

                                        <p className="text-foreground">{req.description}</p>

                                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-4 w-4" />
                                                <span>
                                                    {t("member.requests.submitted_on")}: {fmtDate(req.submittedDate)}
                                                </span>
                                            </div>

                                            <div>
                                                {t("member.requests.expected")}:{" "}
                                                <span className="font-medium text-teal-700">
                                                    {req.expectedMiles.toLocaleString()}
                                                </span>
                                            </div>

                                            {typeof req.actualMiles === "number" && (
                                                <div>
                                                    {t("member.requests.actual")}:{" "}
                                                    <span className="font-medium text-green-600">
                                                        {req.actualMiles.toLocaleString()}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {req.processingNotes && (
                                            <div className="rounded-lg border-l-4 border-blue-400 bg-blue-50 p-3">
                                                <p className="text-sm text-blue-700">
                                                    <strong>{t("member.requests.processing_notes")}:</strong> {req.processingNotes}
                                                </p>
                                            </div>
                                        )}

                                        {req.rejectionReason && (
                                            <div className="rounded-lg border-l-4 border-red-400 bg-red-50 p-3">
                                                <p className="text-sm text-red-700">
                                                    <strong>{t("member.requests.rejection_reason")}:</strong> {req.rejectionReason}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <Button variant="outline" size="sm" className="ml-4">
                                    <Eye className="mr-1 h-4 w-4" />
                                    {t("common.detail")}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Empty state (kept for completeness) */}
            {mockRequests.length === 0 && (
                <Card className="border-teal-200">
                    <CardContent className="p-12 text-center">
                        <FileText className="mx-auto mb-4 h-16 w-16 text-teal-200" />
                        <h3 className="mb-2 text-teal-700">{t("member.requests.empty.title")}</h3>
                        <p className="mb-4 text-muted-foreground">{t("member.requests.empty.subtitle")}</p>
                        <Button className="bg-teal-600 hover:bg-teal-700">{t("member.requests.create_first")}</Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
