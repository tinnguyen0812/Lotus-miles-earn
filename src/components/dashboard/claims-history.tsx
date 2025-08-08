"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const mockClaims = [
  {
    id: "CLM987654",
    flightNumber: "VN248",
    flightDate: "2024-05-15",
    status: "Approved",
    miles: 1500,
  },
  {
    id: "CLM876543",
    flightNumber: "VJ161",
    flightDate: "2024-04-22",
    status: "Approved",
    miles: 950,
  },
  {
    id: "CLM765432",
    flightNumber: "QH1021",
    flightDate: "2024-03-30",
    status: "Rejected",
    miles: 0,
  },
  {
    id: "CLM654321",
    flightNumber: "VN773",
    flightDate: "2024-02-11",
    status: "Approved",
    miles: 2800,
  },
  {
    id: "CLM543210",
    flightNumber: "VN216",
    flightDate: "2024-01-05",
    status: "Pending",
    miles: 0,
  },
];

export function ClaimsHistory() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Claims</CardTitle>
        <CardDescription>
          A history of your recent mileage claims.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="w-full overflow-x-auto">
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>Claim ID</TableHead>
                <TableHead>Flight</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Miles</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {mockClaims.map((claim) => (
                <TableRow key={claim.id}>
                    <TableCell className="font-medium">{claim.id}</TableCell>
                    <TableCell>{claim.flightNumber}</TableCell>
                    <TableCell>{claim.flightDate}</TableCell>
                    <TableCell>
                    <Badge
                        variant={
                        claim.status === "Approved"
                            ? "default"
                            : claim.status === "Pending"
                            ? "secondary"
                            : "destructive"
                        }
                        className={cn(claim.status === 'Approved' && 'bg-green-600 text-white')}
                    >
                        {claim.status}
                    </Badge>
                    </TableCell>
                    <TableCell
                    className={cn(
                        "text-right font-semibold",
                        claim.status === "Approved" && "text-green-600"
                    )}
                    >
                    {claim.status === "Approved" ? `+${claim.miles.toLocaleString()}` : "-"}
                    </TableCell>
                </TableRow>
                ))}
            </TableBody>
            </Table>
        </div>
      </CardContent>
    </Card>
  );
}
