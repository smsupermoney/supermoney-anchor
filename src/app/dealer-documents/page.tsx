
"use server"

import PageHeader from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { dealerLeads } from "@/lib/data";
import DealerDocumentsTable from "./dealer-documents-table";

export default async function DealerDocumentsPage() {
    const leadsForVerification = dealerLeads.filter(lead => lead.status === 'Documents Collected' || lead.status === 'Documents Verified');

  return (
    <>
      <PageHeader title="Document Verification" />
      <Card className="mt-4">
        <CardHeader>
            <CardTitle>Pending Verifications</CardTitle>
            <CardDescription>Review and verify documents for onboarding dealers. This includes roles for Onboarding Ops and Legal/Compliance.</CardDescription>
        </CardHeader>
        <CardContent>
            <DealerDocumentsTable leads={leadsForVerification} />
        </CardContent>
      </Card>
    </>
  );
}
