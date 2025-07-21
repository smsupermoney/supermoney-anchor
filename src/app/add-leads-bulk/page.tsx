
import PageHeader from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import UploadExcelForm from "../add-program/upload-excel-form";
import DownloadSampleExcel from "@/components/download-sample-excel";
import { sampleMomentumLeads } from "@/lib/dummy-data";
import { addMomentumLeads } from "./actions";

export default function AddLeadsBulkPage() {
  return (
    <>
      <PageHeader title="Add New Leads (Bulk)" />
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Bulk Import Leads</CardTitle>
          <CardDescription className="flex justify-between items-center">
            <span>
              Upload an Excel file with lead data. The first sheet should contain a header row and rows with lead information.
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
