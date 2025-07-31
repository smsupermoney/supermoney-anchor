
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
      <PageHeader title="Add New Lead" />
        <Card className="mt-4">
            <CardHeader>
                <CardTitle>Lead Details</CardTitle>
                <CardDescription>
                    Enter the details for the new lead. For bulk uploads, please use the 'Bulk Lead Upload' button on the All Leads page.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {/* A form for single lead creation would go here */}
                <p className="text-muted-foreground">The single lead creation form is under development.</p>
            </CardContent>
        </Card>
    </>
  );
}
