
"use server";

import PageHeader from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { dealerLeads } from "@/lib/data";
import BusinessLimitTable from "./business-limit-table";

export default async function BusinessLimitPage() {
  const leadsForApproval = dealerLeads.filter(
    (lead) => lead.status === "Site Visit Done" || lead.status === "Business Limit Approved"
  );
  
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
          <BusinessLimitTable leads={leadsForApproval} />
        </CardContent>
      </Card>
    </>
  );
}
