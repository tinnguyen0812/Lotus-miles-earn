import { ClaimsHistory } from "@/components/dashboard/claims-history";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome Back!</h1>
          <p className="text-muted-foreground">
            Here&apos;s a summary of your loyalty account.
          </p>
        </div>
        <Button asChild>
          <Link href="/member/claim-miles">
            <PlusCircle className="mr-2 h-4 w-4" />
            Claim New Miles
          </Link>
        </Button>
      </div>

      <StatsCards />

      <ClaimsHistory />
    </div>
  );
}
