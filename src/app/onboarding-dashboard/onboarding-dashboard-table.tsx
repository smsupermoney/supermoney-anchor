
"use client";

import * as React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import StatusBadge from "@/components/status-badge";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { DealerLead } from "@/types";
import { DataTablePagination } from "@/components/ui/data-table-pagination";

type OnboardingDashboardTableProps = {
  leads: DealerLead[];
};

export default function OnboardingDashboardTable({ leads }: OnboardingDashboardTableProps) {
  const [pageIndex, setPageIndex] = React.useState(0);
  const pageSize = 10;

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
                  <TableHead>Contact Person</TableHead>
                  <TableHead>Region</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Current Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedLeads.length > 0 ? (
                    paginatedLeads.map((lead) => (
                    <TableRow key={lead.id} className="cursor-pointer hover:bg-muted">
                        <TableCell className="font-medium">
                        <Link href={`/dealer-leads/${lead.id}`} className="text-primary hover:underline block">
                            {lead.dealerName}
                        </Link>
                        </TableCell>
                         <TableCell>
                            <div>{lead.contactPerson}</div>
                            <div className="text-xs text-muted-foreground">{lead.contactPhone}</div>
                        </TableCell>
                        <TableCell>
                        <Badge variant="secondary">{lead.region}</Badge>
                        </TableCell>
                        <TableCell>{lead.createdAt}</TableCell>
                        <TableCell><StatusBadge status={lead.status} /></TableCell>
                    </TableRow>
                    ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                            No actions required at this time.
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
