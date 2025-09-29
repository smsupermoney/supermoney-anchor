
import PageHeader from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import UploadExcelForm from "@/components/upload-excel-form";
import { updateDealerGst } from "./actions";
import DownloadSampleExcel from "@/components/download-sample-excel";

const sampleGstUpdate = [
    {
        applicationId: "APP001",
        GST: "27ABCDE1234F1Z5",
    },
    {
        applicationId: "APP002",
        GST: "29ABCDE5678F1Z6",
    }
];

export default function UpdateGstPage() {
  return (
    <>
      <PageHeader title="Update Dealer GST" />
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Bulk Update GST Numbers</CardTitle>
          <CardDescription className="flex justify-between items-center">
            <span>
              Upload an Excel file with `applicationId` and `GST` columns. The GST will be updated for the matching dealer.
            </span>
             <DownloadSampleExcel data={sampleGstUpdate} fileName="sample-gst-update.xlsx" />
          </CardDescription>
        </CardHeader>
        <CardContent>
            <UploadExcelForm action={updateDealerGst} buttonText="Upload and Update GST" />
        </CardContent>
      </Card>
    </>
  );
}
