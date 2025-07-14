
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle } from "lucide-react";
import type { User } from "@/types";

const users: User[] = [
    {
        id: "USR001",
        userName: "anchor_user",
        password: "****************",
        phoneNumber: "+91 98765 43210",
        emailAddress: "anchor@supermoney.in",
        roleType: "Anchor",
        lastLoginTime: "2024-07-21 10:00 AM",
        lastLoginIp: "192.168.1.1",
    }
];

export default function SettingsPage() {
  return (
    <>
      <PageHeader title="User Accounts">
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </PageHeader>
      <Card className="mt-4">
        <CardHeader>
            <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative w-full overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User Name</TableHead>
                  <TableHead>Password</TableHead>
                  <TableHead>Phone Number</TableHead>
                  <TableHead>Email Address</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Last Login Time</TableHead>
                  <TableHead>Last Login IP</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.userName}</TableCell>
                    <TableCell>{user.password}</TableCell>
                    <TableCell>{user.phoneNumber}</TableCell>
                    <TableCell>{user.emailAddress}</TableCell>
                    <TableCell>{user.roleType}</TableCell>
                    <TableCell>{user.lastLoginTime}</TableCell>
                    <TableCell>{user.lastLoginIp}</TableCell>
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
