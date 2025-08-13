"use client";

import { useMemo } from "react";
import { useTranslation } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, ShoppingBag, Plane } from "lucide-react";

type TxType = "flight" | "partner" | "bonus" | "manual";
type TxStatus = "completed" | "pending" | "rejected";

export interface MileTransaction {
  id: string;
  type: TxType;
  description: string;
  date: string; // ISO yyyy-mm-dd
  miles: number;
  status: TxStatus;
}

const mockTransactions: MileTransaction[] = [
  { id: "1", type: "flight",  description: "SGN → HAN (VN210)",                       date: "2025-08-08", miles: 1250, status: "completed" },
  { id: "2", type: "partner", description: "Vincom purchase • invoice #VIN123456",     date: "2025-08-05", miles: 500,  status: "completed" },
  { id: "3", type: "manual",  description: "Manual claim • International flight",      date: "2025-08-03", miles: 2000, status: "pending"   },
  { id: "4", type: "flight",  description: "HAN → SGN (VN215)",                         date: "2025-07-28", miles: 1250, status: "completed" },
  { id: "5", type: "bonus",   description: "Welcome bonus",                             date: "2025-07-15", miles: 1000, status: "completed" },
  { id: "6", type: "partner", description: "VietinBank Credit Card payment",           date: "2025-07-12", miles: 300,  status: "completed" },
];

export function MilesHistory() {
  const { t, locale } = useTranslation();

  const fmtDate = (iso: string) =>
    new Intl.DateTimeFormat(locale ?? "en-US", { day: "2-digit", month: "2-digit", year: "numeric" })
      .format(new Date(iso));

  const typeIcon = (type: TxType) => {
    switch (type) {
      case "flight":  return <Plane className="h-4 w-4 text-teal-700" />;
      case "partner": return <ShoppingBag className="h-4 w-4 text-emerald-700" />;
      case "manual":  return <MapPin className="h-4 w-4 text-orange-700" />;
      default:        return <Calendar className="h-4 w-4 text-violet-700" />;
    }
  };

  const statusBadge = (st: TxStatus) => {
    if (st === "completed") return <Badge className="bg-green-100 text-green-800">{t("member.history.status.completed")}</Badge>;
    if (st === "pending")   return <Badge className="bg-orange-100 text-orange-800">{t("member.history.status.pending")}</Badge>;
    if (st === "rejected")  return <Badge className="bg-red-100 text-red-800">{t("member.history.status.rejected")}</Badge>;
    return <Badge>—</Badge>;
  };

  const summary = useMemo(() => {
    const completed = mockTransactions.filter(x => x.status === "completed").length;
    const pending   = mockTransactions.filter(x => x.status === "pending").length;
    const thisMonthTotal = mockTransactions
      .filter(x => {
        const d = new Date(x.date);
        const now = new Date();
        return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
      })
      .reduce((s, x) => s + x.miles, 0);
    return { completed, pending, thisMonthTotal };
  }, []);

  const typeLabel = (type: TxType) => t(`member.history.type.${type}`);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-teal-700 text-xl font-semibold">{t("member.history.title")}</h2>
        <p className="text-muted-foreground">{t("member.history.subtitle")}</p>
      </div>

      <Card className="border-teal-200">
        <CardHeader>
          <CardTitle className="text-teal-700">{t("member.history.recent_transactions")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-teal-100">
                <TableHead className="text-teal-700">{t("member.history.columns.type")}</TableHead>
                <TableHead className="text-teal-700">{t("member.history.columns.description")}</TableHead>
                <TableHead className="text-teal-700">{t("member.history.columns.date")}</TableHead>
                <TableHead className="text-teal-700">{t("member.history.columns.miles")}</TableHead>
                <TableHead className="text-teal-700">{t("member.history.columns.status")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockTransactions.map((tx, idx) => (
                <TableRow key={tx.id} className={idx % 2 ? "bg-white" : "bg-teal-50/30"}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {typeIcon(tx.type)}
                      <span className="capitalize">{typeLabel(tx.type)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <div className="truncate">{tx.description}</div>
                  </TableCell>
                  <TableCell>{fmtDate(tx.date)}</TableCell>
                  <TableCell>
                    <span className="font-semibold text-teal-700">+{tx.miles.toLocaleString()}</span>
                  </TableCell>
                  <TableCell>{statusBadge(tx.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-teal-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-teal-700">{summary.thisMonthTotal.toLocaleString()}</div>
            <p className="text-sm text-muted-foreground">{t("member.history.summary.this_month")}</p>
          </CardContent>
        </Card>
        <Card className="border-teal-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-teal-700">{summary.completed}</div>
            <p className="text-sm text-muted-foreground">{t("member.history.summary.completed")}</p>
          </CardContent>
        </Card>
        <Card className="border-teal-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{summary.pending}</div>
            <p className="text-sm text-muted-foreground">{t("member.history.summary.pending")}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
