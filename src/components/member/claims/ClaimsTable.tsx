"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "./StatusBadge";
import { useTranslation } from "@/lib/i18n";

export type Claim = {
  id: string;
  flightNumber: string;
  date: string;
  status: "approved" | "pending" | "rejected";
  miles: number;
};

export function ClaimsTable({ claims }: { claims: Claim[] }) {
  const { t } = useTranslation();
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("member.dashboard.recent_claims")}</CardTitle>
        <CardDescription>{t("member.dashboard.recent_claims_desc")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="w-full overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("member.claims_table.claim_id")}</TableHead>
                <TableHead>{t("member.claims_table.flight")}</TableHead>
                <TableHead>{t("member.claims_table.date")}</TableHead>
                <TableHead>{t("member.claims_table.status")}</TableHead>
                <TableHead className="text-right">{t("member.claims_table.miles")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {claims.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    {t("member.claims_table.no_claims")}
                  </TableCell>
                </TableRow>
              ) : (
                claims.map((claim) => (
                  <TableRow key={claim.id}>
                    <TableCell className="font-medium">{claim.id}</TableCell>
                    <TableCell>{claim.flightNumber}</TableCell>
                    <TableCell>{claim.date}</TableCell>
                    <TableCell>
                      <StatusBadge status={claim.status} />
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {claim.status === "approved"
                        ? `+${claim.miles.toLocaleString()}`
                        : "-"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
