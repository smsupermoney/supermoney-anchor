
"use server";

import PageHeader from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { dealerLeads } from "@/lib/data";
import SiteVisitsTable from "./site-visits-table";

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
          <SiteVisitsTable leads={leadsForSiteVisit} />
        </CardContent>
      </Card>
    </>
  );
}
