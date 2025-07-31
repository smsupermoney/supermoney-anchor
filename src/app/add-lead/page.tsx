
"use server"

import PageHeader from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import AddLeadForm from "./add-lead-form";
import BulkLeadUploadDialog from "@/components/bulk-lead-upload-dialog";
import { Button } from "@/components/ui/button";

export default async function AddLeadPage() {
    const session = await getSession();

    if (session?.roleType === 'Anchor') {
        // This logic can be refined based on product requirements
    }

  return (
    <>
      <PageHeader title="Add New Lead">
        <BulkLeadUploadDialog />
      </PageHeader>
        <Card className="mt-4">
            <CardHeader>
                <CardTitle>Lead Details</CardTitle>
                <CardDescription>
                    Enter the details for the new lead. For bulk uploads, use the button in the header.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <AddLeadForm />
            </CardContent>
        </Card>
    </>
  );
}
