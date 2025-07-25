
"use client";

import * as React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import StatusBadge from "@/components/status-badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { DealerLead } from "@/types";
import { DataTablePagination } from "@/components/ui/data-table-pagination";

type SiteVisitsTableProps = {
  leads: DealerLead[];
};

export default function SiteVisitsTable({ leads }: SiteVisitsTableProps) {
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
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Report Submitted</TableHead>
                <TableHead>Action</TableHead>
            </TableRow>
            </TableHeader>
            <TableBody>
            {paginatedLeads.length > 0 ? (
                paginatedLeads.map((lead) => (
                <TableRow key={lead.id}>
                    <TableCell className="font-medium">{lead.dealerName}</TableCell>
                    <TableCell>{lead.location}</TableCell>
                    <TableCell>
                    <StatusBadge status={lead.status} />
                    </TableCell>
                    <TableCell>
                    {lead.siteVisitReport ? "Yes" : "No"}
                    </TableCell>
                    <TableCell>
                    <Button asChild variant="outline" size="sm">
                        <Link href={`/dealer-leads/${lead.id}`}>
                        {lead.siteVisitReport ? "View Report" : "Submit Report"}
                        </Link>
                    </Button>
                    </TableCell>
                </TableRow>
                ))
            ) : (
                <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No leads are currently awaiting a site visit.
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
