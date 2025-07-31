
"use server"

import PageHeader from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import AddLeadForm from "./add-lead-form";

export default async function AddLeadPage() {
    const session = await getSession();

    if (session?.roleType === 'Anchor') {
        // Anchors should not access this page directly unless they have specific sub-roles
        // This logic can be refined based on product requirements
    }

  return (
    <>
      <PageHeader title="Add New Leads (Bulk)" />
        <Card className="mt-4">
            <CardHeader>
                <CardTitle>Bulk Import Leads</CardTitle>
                <CardDescription>
                    Upload an Excel file with lead data based on the provided template.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <AddLeadForm />
            </CardContent>
        </Card>
    </>
  );
}
