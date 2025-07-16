
"use server";

import PageHeader from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { dealerLeads } from "@/lib/data";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import StatusBadge from "@/components/status-badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function SiteVisitsPage() {
  const leadsForSiteVisit = dealerLeads.filter(
    (lead) => lead.status === "Documents Verified" || lead.status === "Site Visit Done"
  );

  return (
    <>
      <PageHeader title="Site Visit Reports" />
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Leads Awaiting Site Visit</CardTitle>
          <CardDescription>
            View leads that are ready for a site visit or review submitted reports.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative w-full overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Dealer Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Report Submitted</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leadsForSiteVisit.length > 0 ? (
                  leadsForSiteVisit.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell className="font-medium">{lead.dealerName}</TableCell>
                      <TableCell>{lead.location}</TableCell>
                      <TableCell>
                        <StatusBadge status={lead.status} />
                      </TableCell>
                      <TableCell>
                        {lead.siteVisitReport ? "Yes" : "No"}
                      </TableCell>
                      <TableCell>
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/dealer-leads/${lead.id}`}>
                            {lead.siteVisitReport ? "View Report" : "Submit Report"}
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No leads are currently awaiting a site visit.
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
