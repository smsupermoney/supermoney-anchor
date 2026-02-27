import PageHeader from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import UploadExcelForm from "@/components/upload-excel-form";
import { updateDealerEmail } from "./actions";
import DownloadSampleExcel from "@/components/download-sample-excel";

const sampleEmailUpdate = [
    {
        applicationId: "APP001",
        emailAddress: "dealer1@example.com",
    },
    {
        applicationId: "APP002",
        emailAddress: "dealer2@example.com",
    }
];

export default function UpdateEmailPage() {
  return (
    <>
      <PageHeader title="Update Dealer Email" />
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Bulk Update Email Addresses</CardTitle>
          <CardDescription className="flex justify-between items-center">
            <span>
              Upload an Excel file with `applicationId` and `emailAddress` columns. The email will be updated for the matching dealer.
            </span>
             <DownloadSampleExcel data={sampleEmailUpdate} fileName="sample-email-update.xlsx" />
          </CardDescription>
        </CardHeader>
        <CardContent>
            <UploadExcelForm action={updateDealerEmail} buttonText="Upload and Update Emails" />
        </CardContent>
      </Card>
    </>
  );
}
