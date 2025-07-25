
"use client";

import * as React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import StatusBadge from "@/components/status-badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { DealerLead } from "@/types";
import { DataTablePagination } from "@/components/ui/data-table-pagination";

type DealerDocumentsTableProps = {
  leads: DealerLead[];
};

export default function DealerDocumentsTable({ leads }: DealerDocumentsTableProps) {
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
                        <TableHead>Documents</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {paginatedLeads.length > 0 ? (
                        paginatedLeads.map(lead => (
                            <TableRow key={lead.id}>
                                <TableCell className="font-medium">{lead.dealerName}</TableCell>
                                <TableCell>
                                    <div className="flex flex-wrap gap-1">
                                        {lead.documents?.map(doc => (
                                            <Badge key={doc.name} variant={doc.status === 'Verified' ? 'default' : 'secondary'}>{doc.name}</Badge>
                                        ))}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <StatusBadge status={lead.status} />
                                </TableCell>
                                <TableCell>
                                    <Button asChild variant="outline" size="sm">
                                        <Link href={`/dealer-leads/${lead.id}`}>View & Verify</Link>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                            <TableRow>
                            <TableCell colSpan={4} className="text-center text-muted-foreground">
                                No leads are currently awaiting document verification.
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
