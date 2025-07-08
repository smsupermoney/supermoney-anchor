
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, ArrowRight } from "lucide-react";
import StatusBadge from "@/components/status-badge";
import { onboardingPartners } from "@/lib/data";
import Link from "next/link";
import { AddPartnerDialog } from "./add-partner-dialog";

export default function PartnerManagementPage() {
  return (
    <>
      <PageHeader title="Partner Management">
        <AddPartnerDialog>
          <Button>
            <PlusCircle className="mr-2" />
            Add New Partner
          </Button>
        </AddPartnerDialog>
      </PageHeader>
      
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Onboarding Pipeline</CardTitle>
            <CardDescription>
              Track all partners through the onboarding workflow.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Business Name</TableHead>
                  <TableHead>Partner Type</TableHead>
                  <TableHead>Assigned RM</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {onboardingPartners.map((partner) => (
                  <TableRow key={partner.id}>
                    <TableCell className="font-medium">{partner.businessName}</TableCell>
                    <TableCell>{partner.partnerType}</TableCell>
                    <TableCell>{partner.assignedRM}</TableCell>
                    <TableCell>
                      <StatusBadge status={partner.status} />
                    </TableCell>
                    <TableCell>
                      <Button asChild variant="ghost" size="icon" disabled>
                        {/* In a real app, this would link to /partner-management/{partner.id} */}
                        <Link href="#">
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
