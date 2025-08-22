"use client";

import AdminDirectMileagePage from "@/components/admin/AddMilesForm"
import withAdminGuard from "@/components/auth/withAdminGuard";

function AddMilesPage() {
  return <AdminDirectMileagePage />;
}

export default withAdminGuard(AddMilesPage);
