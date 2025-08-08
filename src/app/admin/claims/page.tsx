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

function AdminClaimsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Claim Management</h1>
        <p className="text-muted-foreground">
          Review and process member mileage claims.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Claims</CardTitle>
          <CardDescription>
            The following claims require your review.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ClaimsTable />
        </CardContent>
      </Card>
    </div>
  );
}

export default withAdminGuard(AdminClaimsPage);
