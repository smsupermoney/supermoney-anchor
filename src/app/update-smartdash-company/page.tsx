import PageHeader from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import UploadExcelForm from "@/components/upload-excel-form";
import DownloadSampleExcel from "@/components/download-sample-excel";
import { bulkUpdateSmartdashCompany } from "./actions";

const sampleData = [
  { externalId: "ANC001", SmartdashCompanyName: "STARK_GLOBAL" },
  { externalId: "ANC002", SmartdashCompanyName: "WAYNE_CORP" }
];

export default function UpdateSmartdashCompanyPage() {
  return (
    <>
      <PageHeader title="Update Smartdash Company" />
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Bulk Update Company Names</CardTitle>
          <CardDescription className="flex justify-between items-center">
            <span>Updates SmartdashCompanyName for all users sharing the same External ID.</span>
            <DownloadSampleExcel data={sampleData} fileName="company-mappings.xlsx" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UploadExcelForm action={bulkUpdateSmartdashCompany} buttonText="Update Company Names" />
        </CardContent>
      </Card>
    </>
  );
}
