"use client";

import * as React from "react";
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
import { callApi } from "@/lib/api-client";

interface Claim {
  id: string;
  flightNumber: string;
  flightDate: string;
  status: string;
  miles: number;
}

export function ClaimsHistory() {
  const [claims, setClaims] = React.useState<Claim[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    callApi<Claim[]>({ method: "GET", path: "/api/claims" })
      .then((data) => setClaims(data))
      .catch((err: any) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

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
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-destructive">
                    {error}
                  </TableCell>
                </TableRow>
              ) : claims.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    No recent claims.
                  </TableCell>
                </TableRow>
              ) : (
                claims.map((claim) => (
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
                        className={cn(
                          claim.status === "Approved" && "bg-green-600 text-white"
                        )}
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
                      {claim.status === "Approved"
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
