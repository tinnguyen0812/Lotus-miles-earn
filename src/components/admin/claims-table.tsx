"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Download, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { callApi } from "@/lib/api-client";

const mockClaims = [
  {
    id: "CLM789123",
    userName: "Alex Johnson",
    userId: "user001",
    flightNumber: "VN248",
    flightDate: "2024-07-20",
    submissionDate: "2024-07-21",
    status: "pending",
    attachmentUrl: "#",
    miles: 1500,
  },
  {
    id: "CLM456789",
    userName: "Maria Garcia",
    userId: "user002",
    flightNumber: "VN773",
    flightDate: "2024-07-18",
    submissionDate: "2024-07-19",
    status: "pending",
    attachmentUrl: "#",
    miles: 2800,
  },
  {
    id: "CLM123456",
    userName: "Sam Chen",
    userId: "user003",
    flightNumber: "QH1021",
    flightDate: "2024-07-15",
    submissionDate: "2024-07-16",
    status: "pending",
    attachmentUrl: "#",
    miles: 850,
  },
];

export function ClaimsTable() {
  const [claims, setClaims] = React.useState(mockClaims);
  const { toast } = useToast();

  const handleReview = async (
    claimId: string,
    status: "approved" | "rejected",
    userId: string,
    miles: number
  ) => {
    try {
        const result = await callApi<{ message: string }>({
            method: 'POST',
            path: '/api/claims/review',
            body: { claimId, status, userId, miles },
        });

        toast({
            title: "Action Complete",
            description: result.message,
        });
        setClaims((prevClaims) => prevClaims.filter((c) => c.id !== claimId));
    } catch (error: any) {
        toast({
            title: "Error",
            description: error.message || "Failed to review the claim.",
            variant: "destructive",
        });
    }
  };

  return (
    <div className="w-full overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Claim ID</TableHead>
            <TableHead>Member</TableHead>
            <TableHead>Flight</TableHead>
            <TableHead>Flight Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {claims.length > 0 ? (
            claims.map((claim) => (
              <TableRow key={claim.id}>
                <TableCell className="font-medium">{claim.id}</TableCell>
                <TableCell>{claim.userName}</TableCell>
                <TableCell>{claim.flightNumber}</TableCell>
                <TableCell>{claim.flightDate}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{claim.status}</Badge>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="ghost" size="icon" asChild>
                    <a href={claim.attachmentUrl} download>
                      <Download className="h-4 w-4" />
                      <span className="sr-only">Download Attachment</span>
                    </a>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-green-600 hover:text-green-700 hover:bg-green-100"
                    onClick={() =>
                      handleReview(
                        claim.id,
                        "approved",
                        claim.userId,
                        claim.miles
                      )
                    }
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span className="sr-only">Approve</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-600 hover:text-red-700 hover:bg-red-100"
                    onClick={() =>
                      handleReview(
                        claim.id,
                        "rejected",
                        claim.userId,
                        claim.miles
                      )
                    }
                  >
                    <XCircle className="h-4 w-4" />
                    <span className="sr-only">Reject</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="text-center h-24">
                No pending claims.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
