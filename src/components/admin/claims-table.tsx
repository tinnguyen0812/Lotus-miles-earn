"use client";
import * as React from "react";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { callApi } from "@/lib/api-client";
import StatusBadge from "@/components/admin/status-badge";
import type { Claim } from "@/lib/types";
import { useTranslation } from "@/lib/i18n"; // ✅ dùng i18n của dự án

type Props = { status?: "pending" | "approved" | "rejected" | "all"; query?: string };

// Nếu backend đang là /api/claims thì chỉnh lại hằng số này
const BASE = "/api/claims";

export function ClaimsTable({ status = "pending", query = "" }: Props) {
  const { t, locale } = useTranslation();
  const nf = React.useMemo(() => new Intl.NumberFormat(locale || "en"), [locale]);

  const [rows, setRows] = React.useState<Claim[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const { toast } = useToast();

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await callApi<Claim[]>({
        method: "GET",
        path: BASE,
        params: { status: status === "all" ? undefined : status, q: query || undefined },
      });
      setRows(data);
    } catch (e: any) {
      setError(e?.message || t("admin.claims.error.load"));
    } finally {
      setLoading(false);
    }
  }
  React.useEffect(() => { load(); }, [status, query]);

  async function approve(id: string) {
    try {
      await callApi({ method: "POST", path: `${BASE}/${id}/approve` });
      toast({ title: t("admin.claims.toast.approved") });
      setRows((s) => s.filter((r) => r.id !== id));
    } catch (e: any) {
      toast({ title: "Error", description: e?.message || t("admin.claims.error.approve"), variant: "destructive" });
    }
  }
  async function reject(id: string) {
    try {
      await callApi({ method: "POST", path: `${BASE}/${id}/reject` });
      toast({ title: t("admin.claims.toast.rejected") });
      setRows((s) => s.filter((r) => r.id !== id));
    } catch (e: any) {
      toast({ title: "Error", description: e?.message || t("admin.claims.error.reject"), variant: "destructive" });
    }
  }

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString(locale || "en", { year: "numeric", month: "2-digit", day: "2-digit" });

  return (
    <div className="w-full overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("admin.claims.table.member")}</TableHead>
            <TableHead>{t("admin.claims.table.submittedAt")}</TableHead>
            <TableHead>{t("admin.claims.table.flight")}</TableHead>
            <TableHead>{t("admin.claims.table.miles")}</TableHead>
            <TableHead>{t("admin.claims.table.status")}</TableHead>
            <TableHead className="text-right">{t("admin.claims.table.actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading && (
            <TableRow>
              <TableCell colSpan={6} className="text-center">
                {t("admin.claims.table.loading")}
              </TableCell>
            </TableRow>
          )}
          {!loading && error && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-destructive">
                {error}
              </TableCell>
            </TableRow>
          )}
          {!loading && !error && rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center h-24">
                {t("admin.claims.table.empty")}
              </TableCell>
            </TableRow>
          )}
          {!loading && !error && rows.map((c) => (
            <TableRow key={c.id} className="border-t">
              <TableCell className="py-2">
                <div className="flex items-center gap-2">
                  <div className="size-8 rounded-full bg-muted" />
                  <div>
                    <div className="font-medium">{c.member.name}</div>
                    <div className="text-xs text-muted-foreground">{c.member.id}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell>{fmtDate(c.submittedAt)}</TableCell>
              <TableCell>{c.flight.number} · {c.flight.route}</TableCell>
              <TableCell className="font-medium text-emerald-600">
                +{nf.format(c.milesRequested)}
              </TableCell>
              <TableCell><StatusBadge status={c.status} /></TableCell>
              <TableCell className="text-right space-x-1">
                <Button asChild variant="ghost" size="icon" title="View">
                  <Link href={`/admin/claims/${c.id}`}><Eye className="h-4 w-4" /></Link>
                </Button>
                {c.status === "pending" && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Approve"
                      className="text-green-600 hover:text-green-700 hover:bg-green-100"
                      onClick={() => approve(c.id)}
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Reject"
                      className="text-red-600 hover:text-red-700 hover:bg-red-100"
                      onClick={() => reject(c.id)}
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
