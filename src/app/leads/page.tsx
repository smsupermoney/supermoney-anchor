import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { leads, leadStatuses } from "@/lib/data";
import { PlusCircle } from "lucide-react";
import StatusBadge from "@/components/status-badge";
import ProgressTracker from "@/components/progress-tracker";

export default function LeadsPage() {
  return (
    <>
      <PageHeader title="Leads">
        <Button>
          <PlusCircle className="mr-2" />
          Add Lead
        </Button>
      </PageHeader>
      <Card>
        <CardHeader>
            <CardTitle>All Leads</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Retailer Name</TableHead>
                <TableHead>Contact Person</TableHead>
                <TableHead>Current Status</TableHead>
                <TableHead>Onboarding Progress</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell className="font-medium">{lead.retailerName}</TableCell>
                  <TableCell>{lead.contactPerson} <span className="text-muted-foreground">({lead.contactEmail})</span></TableCell>
                  <TableCell><StatusBadge status={lead.status} /></TableCell>
                  <TableCell>
                    <ProgressTracker steps={leadStatuses.filter(s => s !== 'Dropped')} currentStep={lead.status} className="w-full min-w-[600px]" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
