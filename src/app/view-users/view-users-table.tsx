
"use client";

import * as React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { User } from "@/types";
import { DataTablePagination } from "@/components/ui/data-table-pagination";

type ViewUsersTableProps = {
  users: User[];
};

export default function ViewUsersTable({ users }: ViewUsersTableProps) {
  const [pageIndex, setPageIndex] = React.useState(0);
  const pageSize = 10;
  
  const pageCount = Math.ceil(users.length / pageSize);
  const paginatedUsers = React.useMemo(() => {
    const start = pageIndex * pageSize;
    const end = start + pageSize;
    return users.slice(start, end);
  }, [users, pageIndex, pageSize]);

  return (
    <div className="space-y-4">
        <div className="relative w-full overflow-auto border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User Name / Company</TableHead>
                  <TableHead>Email Address</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Sub Role</TableHead>
                  <TableHead>Anchor/External ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                        {user.userName}
                    </TableCell>
                    <TableCell>
                        {user.emailAddress}
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.roleType === 'Admin' ? 'destructive' : 'default'}>{user.roleType}</Badge>
                    </TableCell>
                    <TableCell>
                        {user.userSubRole ? <Badge variant="secondary">{user.userSubRole}</Badge> : 'N/A'}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                        {user.externalId}
                    </TableCell>
                  </TableRow>
                ))}
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
