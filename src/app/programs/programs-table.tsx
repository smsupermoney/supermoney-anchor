
"use client";

import * as React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { Program } from "@/types";
import { DataTablePagination } from "@/components/ui/data-table-pagination";

type ProgramsTableProps = {
  programs: (Program & { anchorNames?: string[] })[];
};

export default function ProgramsTable({ programs }: ProgramsTableProps) {
  const [pageIndex, setPageIndex] = React.useState(0);
  const pageSize = 10;
  
  const pageCount = Math.ceil(programs.length / pageSize);
  const paginatedPrograms = React.useMemo(() => {
    const start = pageIndex * pageSize;
    const end = start + pageSize;
    return programs.slice(start, end);
  }, [programs, pageIndex, pageSize]);

  return (
    <div className="space-y-4">
        <div className="relative w-full overflow-auto border rounded-md">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Program ID</TableHead>
                        <TableHead>Lender Name</TableHead>
                        <TableHead>Short Name</TableHead>
                        <TableHead>Lender Type</TableHead>
                        <TableHead>Linked Anchor Names</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {paginatedPrograms.length > 0 ? paginatedPrograms.map((program) => (
                        <TableRow key={program.id}>
                            <TableCell className="font-mono text-xs">{program.programId}</TableCell>
                            <TableCell className="font-medium">{program.lenderName}</TableCell>
                            <TableCell>{program.shortName || 'N/A'}</TableCell>
                            <TableCell>
                                <Badge variant={program.lenderType === 'Supermoney' ? 'default' : 'secondary'}>
                                    {program.lenderType}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <div className="flex flex-col gap-1">
                                    {program.anchorNames && program.anchorNames.length > 0 ? program.anchorNames.map(name => (
                                        <span key={name} className="text-xs">{name}</span>
                                    )) : <span className="text-xs text-muted-foreground">No anchors linked</span>}
                                </div>
                            </TableCell>
                        </TableRow>
                    )) : (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center">No programs found.</TableCell>
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
