
"use client";

import * as React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import StatusBadge from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { MoreVertical } from "lucide-react";
import type { Repayment } from "@/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { DataTablePagination } from "@/components/ui/data-table-pagination";

type CollectionDashboardTableProps = {
  repayments: Repayment[];
};

export default function CollectionDashboardTable({ repayments }: CollectionDashboardTableProps) {
  const [pageIndex, setPageIndex] = React.useState(0);
  const pageSize = 10;
  const { toast } = useToast();

  const formatCurrency = (amount?: number) => {
    if (typeof amount !== 'number') return "N/A";
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount);
  };
  
  const handleResendLink = (invoiceId: string) => {
    toast({ title: "Link Resent", description: `A new repayment link for invoice #${invoiceId} has been sent.` });
  };

  const handleAmountPaid = (repaymentId: string) => {
    toast({ title: "Action Required", description: "Functionality to update paid amount will be added." });
  };
  
  const pageCount = Math.ceil(repayments.length / pageSize);
  const paginatedRepayments = React.useMemo(() => {
    const start = pageIndex * pageSize;
    const end = start + pageSize;
    return repayments.slice(start, end);
  }, [repayments, pageIndex, pageSize]);

  return (
    <div className="space-y-4">
        <div className="relative w-full overflow-auto border rounded-md">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Invoice ID</TableHead>
                        <TableHead>Invoice Amount</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Contact Number</TableHead>
                        <TableHead>Amount Repaid</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Link</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {paginatedRepayments.length > 0 ? (
                        paginatedRepayments.map((repayment) => (
                            <TableRow key={repayment.id}>
                                <TableCell className="font-medium">{repayment.invoiceId}</TableCell>
                                <TableCell>{formatCurrency(repayment.invoiceAmount)}</TableCell>
                                <TableCell>{repayment.dueDate}</TableCell>
                                <TableCell>{repayment.contactNumber}</TableCell>
                                <TableCell>{formatCurrency(repayment.amountRepaid)}</TableCell>
                                <TableCell><StatusBadge status={repayment.status} /></TableCell>
                                <TableCell>
                                    <Button variant="link" asChild className="p-0 h-auto">
                                        <a href={repayment.link} target="_blank" rel="noopener noreferrer">View Link</a>
                                    </Button>
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => handleResendLink(repayment.invoiceId)}>
                                                Resend Link
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleAmountPaid(repayment.id)}>
                                                Amount Paid
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={8} className="text-center text-muted-foreground">
                                No repayments added yet.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
         <DataTablePagination
            pageIndex={pageIndex}
            pageCount={pageCount}
            setPageIndex={setPageIndex}
            hasNextPage={pageIndex < pageCount - 1}
            hasPreviousPage={pageIndex > 0}
        />
    </div>
  );
}
