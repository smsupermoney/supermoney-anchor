
"use server"

import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";
import { getSession } from "@/lib/session";
import { dealerLeads } from "@/lib/data";
import Link from "next/link";
import DealerLeadsTable from "./dealer-leads-table";

export default async function DealerLeadsPage() {
  const session = await getSession();
  const userSubRole = session?.userSubRole;

  const canCreateLead = userSubRole === 'sales_person';

  // In a real app, you would fetch data based on user role
  const leads = dealerLeads;

  return (
    <>
      <PageHeader title="Dealer Onboarding Leads">
        {canCreateLead && (
          <Button asChild>
            <Link href="/add-lead">
                <PlusCircle className="mr-2 h-4 w-4"/>
                Add Lead
            </Link>
          </Button>
        )}
      </PageHeader>
      <Card className="mt-4">
        <CardHeader>
            <CardTitle>All Onboarding Leads</CardTitle>
        </CardHeader>
        <CardContent>
            <DealerLeadsTable leads={leads} />
        </CardContent>
      </Card>
    </>
  );
}
