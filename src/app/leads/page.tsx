
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { leads, leadStatuses } from "@/lib/data";
import { PlusCircle, Upload } from "lucide-react";
import StatusBadge from "@/components/status-badge";
import ProgressTracker from "@/components/progress-tracker";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions } from "@/lib/session";
import type { User } from "@/types";

export default async function LeadsPage() {
  const session = await getIronSession<User>(cookies(), sessionOptions);
  const isAdmin = session.roleType === 'Admin';
  return (
    <>
      <PageHeader title="Leads">
        {isAdmin ? (
          <div className="flex gap-2">
            <Button variant="outline"><Upload className="mr-2 h-4 w-4"/>Upload Excel</Button>
            <Button><PlusCircle className="mr-2 h-4 w-4"/>Add Lead</Button>
          </div>
        ) : (
          <Button>
            <PlusCircle className="mr-2" />
            Add Lead
          </Button>
        )}
      </PageHeader>
      <Card>
        <CardHeader>
            <CardTitle>All Leads</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative w-full overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Dealer Name</TableHead>
                  <TableHead>Contact Person</TableHead>
                  <TableHead>Current Status</TableHead>
                  <TableHead>Onboarding Progress</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell className="font-medium">{lead.dealerName}</TableCell>
                    <TableCell>{lead.contactPerson} <span className="text-muted-foreground">({lead.contactEmail})</span></TableCell>
                    <TableCell><StatusBadge status={lead.status} /></TableCell>
                    <TableCell>
                      <ProgressTracker steps={leadStatuses.filter(s => s !== 'Dropped')} currentStep={lead.status} className="w-full min-w-[600px]" />
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
