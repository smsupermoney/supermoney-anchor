
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import type { UpcomingPaymentItem } from "@/types";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type UpcomingPaymentsTableProps = {
  payments: UpcomingPaymentItem[];
  isAdmin: boolean;
};

export default function UpcomingPaymentsTable({ payments, isAdmin }: UpcomingPaymentsTableProps) {
  const [pageIndex, setPageIndex] = React.useState(0);
  const pageSize = 10;

  const pageCount = Math.ceil(payments.length / pageSize);
  const paginatedPayments = React.useMemo(() => {
    const start = pageIndex * pageSize;
    const end = start + pageSize;
    return payments.slice(start, end);
  }, [payments, pageIndex, pageSize]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Outstanding Payments</CardTitle>
        <CardDescription>
          A list of all outstanding payments due from dealers.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="relative w-full overflow-auto border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Dealer Name</TableHead>
                  <TableHead>Dealer ID</TableHead>
                  <TableHead>Lender</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead className="text-right">Outstanding Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedPayments.length > 0 ? (
                  paginatedPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="truncate max-w-[150px]">{payment.dealerName}</div>
                                </TooltipTrigger>
                                <TooltipContent><p>{payment.dealerName}</p></TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell>
                         <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="truncate max-w-[150px]">{payment.dealerId}</div>
                                </TooltipTrigger>
                                <TooltipContent><p>{payment.dealerId}</p></TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                       <TableCell>
                         <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="truncate max-w-[150px]">{payment.lender}</div>
                                </TooltipTrigger>
                                <TooltipContent><p>{payment.lender}</p></TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell>{payment.dueDate}</TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(payment.outstandingAmount)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={isAdmin ? 5 : 4} className="text-center text-muted-foreground">
                      No upcoming payments found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {pageCount > 0 && (
            <DataTablePagination
              pageIndex={pageIndex}
              pageCount={pageCount}
              setPageIndex={setPageIndex}
              hasNextPage={pageIndex < pageCount - 1}
              hasPreviousPage={pageIndex > 0}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

