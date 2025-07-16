
"use server";

import PageHeader from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { dealerLeads } from "@/lib/data";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import StatusBadge from "@/components/status-badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function DealerActivationPage() {
  const leadsForActivation = dealerLeads.filter(
    (lead) => lead.status === "Business Limit Approved" || lead.status === "Dealer Activated"
  );
  
  return (
    <>
      <PageHeader title="Dealer Activation" />
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Ready for Activation</CardTitle>
          <CardDescription>
            Finalize onboarding and generate dealer codes for approved leads.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative w-full overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Dealer Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Dealer Code</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leadsForActivation.length > 0 ? (
                  leadsForActivation.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell className="font-medium">{lead.dealerName}</TableCell>
                      <TableCell>
                        <StatusBadge status={lead.status} />
                      </TableCell>
                       <TableCell>
                        {lead.dealerCode ? (
                            <Badge>{lead.dealerCode}</Badge>
                        ) : (
                            'Not Generated'
                        )}
                      </TableCell>
                      <TableCell>
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/dealer-leads/${lead.id}`}>
                            {lead.status === 'Business Limit Approved' ? 'Activate Dealer' : 'View'}
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      No dealers are currently ready for activation.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
