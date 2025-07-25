
"use client";

import * as React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import StatusBadge from "@/components/status-badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { DealerLead } from "@/types";
import { DataTablePagination } from "@/components/ui/data-table-pagination";

type BusinessLimitTableProps = {
  leads: DealerLead[];
};

export default function BusinessLimitTable({ leads }: BusinessLimitTableProps) {
  const [pageIndex, setPageIndex] = React.useState(0);
  const pageSize = 10;
  
  const formatCurrency = (amount?: number) => {
    if (typeof amount !== 'number') return "N/A";
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount);
  };

  const pageCount = Math.ceil(leads.length / pageSize);
  const paginatedLeads = React.useMemo(() => {
    const start = pageIndex * pageSize;
    const end = start + pageSize;
    return leads.slice(start, end);
  }, [leads, pageIndex, pageSize]);

  return (
    <div className="space-y-4">
        <div className="relative w-full overflow-auto border rounded-md">
        <Table>
            <TableHeader>
            <TableRow>
                <TableHead>Dealer Name</TableHead>
                <TableHead>Region</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Approved Limit</TableHead>
                <TableHead>Action</TableHead>
            </TableRow>
            </TableHeader>
            <TableBody>
            {paginatedLeads.length > 0 ? (
                paginatedLeads.map((lead) => (
                <TableRow key={lead.id}>
                    <TableCell className="font-medium">{lead.dealerName}</TableCell>
                    <TableCell>{lead.region}</TableCell>
                    <TableCell>
                    <StatusBadge status={lead.status} />
                    </TableCell>
                    <TableCell>
                    {lead.status === 'Business Limit Approved' ? formatCurrency(lead.businessLimit) : 'Pending'}
                    </TableCell>
                    <TableCell>
                    <Button asChild variant="outline" size="sm">
                        <Link href={`/dealer-leads/${lead.id}`}>
                        {lead.status === 'Site Visit Done' ? 'Approve Limit' : 'View'}
                        </Link>
                    </Button>
                    </TableCell>
                </TableRow>
                ))
            ) : (
                <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No leads are currently awaiting business limit approval.
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
