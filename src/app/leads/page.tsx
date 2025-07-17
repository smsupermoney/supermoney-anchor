
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { leads, leadStatuses } from "@/lib/data";
import { PlusCircle, Upload } from "lucide-react";
import StatusBadge from "@/components/status-badge";
import ProgressTracker from "@/components/progress-tracker";
import { getSession } from "@/lib/session";

export default async function LeadsPage() {
  const session = await getSession();
  const isAdmin = session?.roleType === 'Admin';
  return (
    <>
      <PageHeader title="Leads" />
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
