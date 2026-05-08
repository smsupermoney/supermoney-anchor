import PageHeader from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import UploadExcelForm from "@/components/upload-excel-form";
import DownloadSampleExcel from "@/components/download-sample-excel";
import { bulkUpdateSmartdashLender } from "./actions";

const sampleData = [
  { programId: "PROG001", SmartdashLender: "SBI_CHANNEL_FINANCE" },
  { programId: "PROG002", SmartdashLender: "AXIS_SUPPLY_CHAIN" }
];

export default function UpdateSmartdashLenderPage() {
  return (
    <>
      <PageHeader title="Update Smartdash Lender" />
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Bulk Update Lender Mappings</CardTitle>
          <CardDescription className="flex justify-between items-center">
            <span>Updates SmartdashLender for existing programs using the Program ID.</span>
            <DownloadSampleExcel data={sampleData} fileName="lender-mappings.xlsx" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UploadExcelForm action={bulkUpdateSmartdashLender} buttonText="Update Lender Mappings" />
        </CardContent>
      </Card>
    </>
  );
}
