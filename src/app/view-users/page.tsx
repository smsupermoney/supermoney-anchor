
"use server"

import PageHeader from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getUsers } from "@/lib/data";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";

export default async function ViewUsersPage() {
  const session = await getSession();

  if (session?.roleType !== 'Admin') {
    redirect('/dashboard');
  }

  const users = await getUsers();

  return (
    <>
      <PageHeader title="View All Users" />
      <Card className="mt-4">
        <CardHeader>
            <CardTitle>User Accounts</CardTitle>
            <CardDescription>A list of all users in the system.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative w-full overflow-auto">
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
                {users.map((user) => (
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
        </CardContent>
      </Card>
    </>
  );
}
