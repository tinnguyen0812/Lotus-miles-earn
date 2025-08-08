
import { ClaimForm } from "@/components/claims/claim-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileQuestion } from "lucide-react";

export default function ClaimMilesPage() {
  return (
    <div className="space-y-6">
       <div>
        <h1 className="text-2xl font-bold tracking-tight">Manual Miles Claim</h1>
        <p className="text-muted-foreground">
          Submit your flight details to claim your miles.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
            <ClaimForm />
        </div>
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
                    <div className="bg-primary/10 p-3 rounded-md">
                        <FileQuestion className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle>How It Works</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                   <p>1. Fill in your flight number and date manually.</p>
                   <p>2. Upload your e-ticket or boarding pass for our records.</p>
                   <p>3. Review the information and submit your claim.</p>
                   <p>4. Your claim will be reviewed by our team.</p>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
