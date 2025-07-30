
"use server"

import PageHeader from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import UploadExcelForm from "../add-program/upload-excel-form";
import { addMomentumLeads } from "../add-leads-bulk/actions";
import DownloadSampleExcel from "@/components/download-sample-excel";
import { sampleMomentumLeads } from "@/lib/dummy-data";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function AddLeadPage() {
    const session = await getSession();

    if (session?.roleType === 'Anchor') {
        // Anchors should not access this page directly
        redirect('/dashboard');
    }

  return (
    <>
      <PageHeader title="Add New Leads (Bulk)" />
        <Card className="mt-4">
            <CardHeader>
                <CardTitle>Bulk Import Leads</CardTitle>
                <CardDescription className="flex justify-between items-center">
                    <span>
                        Upload an Excel file with lead data based on the provided template.
                    </span>
                    <DownloadSampleExcel data={sampleMomentumLeads} fileName="sample-momentum-leads.xlsx" />
                </CardDescription>
            </CardHeader>
            <CardContent>
                <UploadExcelForm action={addMomentumLeads} />
            </CardContent>
        </Card>
    </>
  );
}
