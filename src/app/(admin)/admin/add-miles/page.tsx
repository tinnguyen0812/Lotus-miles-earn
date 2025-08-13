"use client";

import { AddMilesForm } from "@/components/admin/AddMilesForm";
import withAdminGuard from "@/components/auth/withAdminGuard";

function AddMilesPage() {
  return <AddMilesForm />;
}

export default withAdminGuard(AddMilesPage);
