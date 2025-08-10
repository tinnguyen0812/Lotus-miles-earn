"use client";

import { ClaimsTable } from "@/components/admin/claims-table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import withAdminGuard from "@/components/auth/withAdminGuard";
import { useTranslation } from "@/lib/i18n";

function AdminClaimsPage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {t("admin.claims.title")}
        </h1>
        <p className="text-muted-foreground">
          {t("admin.claims.subtitle")}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("admin.claims.listTitle")}</CardTitle>
          <CardDescription>{t("admin.claims.listDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <ClaimsTable />
        </CardContent>
      </Card>
    </div>
  );
}

export default withAdminGuard(AdminClaimsPage);
