
"use server";

import PageHeader from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { dealerLeads } from "@/lib/data";
import DealerActivationTable from "./dealer-activation-table";

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
          <DealerActivationTable leads={leadsForActivation} />
        </CardContent>
      </Card>
    </>
  );
}
