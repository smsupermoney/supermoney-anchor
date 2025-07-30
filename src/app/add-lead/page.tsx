
"use server"

import PageHeader from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AddLeadForm from "./add-lead-form";
import UploadExcelForm from "../add-program/upload-excel-form";
import { addMomentumLeads } from "../add-leads-bulk/actions";
import DownloadSampleExcel from "@/components/download-sample-excel";
import { sampleMomentumLeads } from "@/lib/dummy-data";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { getUsers } from "@/lib/data";

export default async function AddLeadPage() {
    const session = await getSession();

    if (session?.roleType === 'Anchor') {
        // Anchors should not access this page directly
        redirect('/dashboard');
    }

    const allUsers = await getUsers();
    const anchorOptions = allUsers
        .filter(u => u.roleType === 'Anchor')
        .map(u => ({ value: u.externalId, label: u.userName }));

  return (
    <>
      <PageHeader title="Add New Lead" />
      <Tabs defaultValue="single" className="mt-4">
        <TabsList className="grid w-full grid-cols-2 max-w-sm">
            <TabsTrigger value="single">Add Single Lead</TabsTrigger>
            <TabsTrigger value="bulk">Bulk Upload</TabsTrigger>
        </TabsList>
        <TabsContent value="single">
            <Card className="mt-2">
                <CardHeader>
                    <CardTitle>Lead Details</CardTitle>
                    <CardDescription>
                        Enter the details for a single new lead.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <AddLeadForm anchorOptions={anchorOptions} />
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="bulk">
             <Card className="mt-2">
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
        </TabsContent>
      </Tabs>
    </>
  );
}
