
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
import type { Invoice } from "@/types";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type UpcomingPaymentsTableProps = {
  invoices: Invoice[];
  isAdmin: boolean;
};

export default function UpcomingPaymentsTable({ invoices, isAdmin }: UpcomingPaymentsTableProps) {
  const [pageIndex, setPageIndex] = React.useState(0);
  const pageSize = 10;

  const pageCount = Math.ceil(invoices.length / pageSize);
  const paginatedInvoices = React.useMemo(() => {
    const start = pageIndex * pageSize;
    const end = start + pageSize;
    return invoices.slice(start, end);
  }, [invoices, pageIndex, pageSize]);

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
          A list of all disbursed invoices that are due for payment.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="relative w-full overflow-auto border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Dealer ID</TableHead>
                  {isAdmin && <TableHead>Anchor</TableHead>}
                  <TableHead>Lender</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead className="text-right">Outstanding Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedInvoices.length > 0 ? (
                  paginatedInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="truncate max-w-[150px]">{invoice.dealerName}</div>
                                </TooltipTrigger>
                                <TooltipContent><p>{invoice.dealerName} ({invoice.dealerId})</p></TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                       {isAdmin && (
                        <TableCell>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="truncate max-w-[150px]">{invoice.anchorName}</div>
                                    </TooltipTrigger>
                                    <TooltipContent><p>{invoice.anchorName}</p></TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </TableCell>
                       )}
                      <TableCell>
                         <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="truncate max-w-[150px]">{invoice.lender}</div>
                                </TooltipTrigger>
                                <TooltipContent><p>{invoice.lender}</p></TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell>{invoice.dueDate}</TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(invoice.disbursementSentAmount)}
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
