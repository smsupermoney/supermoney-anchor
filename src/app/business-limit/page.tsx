
"use server";

import PageHeader from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { dealerLeads } from "@/lib/data";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import StatusBadge from "@/components/status-badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function BusinessLimitPage() {
  const leadsForApproval = dealerLeads.filter(
    (lead) => lead.status === "Site Visit Done" || lead.status === "Business Limit Approved"
  );
  
  const formatCurrency = (amount?: number) => {
    if (typeof amount !== 'number') return "N/A";
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount);
  };


  return (
    <>
      <PageHeader title="Business Limit Approval" />
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Pending Approvals</CardTitle>
          <CardDescription>
            Review and approve business limits for dealers who have completed their site visit.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative w-full overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Dealer Name</TableHead>
                  <TableHead>Region</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Approved Limit</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leadsForApproval.length > 0 ? (
                  leadsForApproval.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell className="font-medium">{lead.dealerName}</TableCell>
                      <TableCell>{lead.region}</TableCell>
                      <TableCell>
                        <StatusBadge status={lead.status} />
                      </TableCell>
                       <TableCell>
                        {lead.status === 'Business Limit Approved' ? formatCurrency(lead.businessLimit) : 'Pending'}
                      </TableCell>
                      <TableCell>
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/dealer-leads/${lead.id}`}>
                            {lead.status === 'Site Visit Done' ? 'Approve Limit' : 'View'}
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      No leads are currently awaiting business limit approval.
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
