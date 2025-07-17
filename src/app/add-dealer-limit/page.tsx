
import PageHeader from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import UploadExcelForm from "../add-program/upload-excel-form";
import { addDealerProgramLimits } from "./actions";
import DownloadSampleExcel from "@/components/download-sample-excel";
import { sampleDealerLimits } from "@/lib/dummy-data";

export default function AddDealerLimitPage() {
  return (
    <>
      <PageHeader title="Add Dealer Limits (Bulk)" />
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Bulk Import Dealer-Program Limits</CardTitle>
          <CardDescription className="flex justify-between items-center">
            <span>
                Upload an Excel file with dealer-program limit data. The first sheet should contain a header row and rows with the limit information.
            </span>
             <DownloadSampleExcel data={sampleDealerLimits} fileName="sample-dealer-limits.xlsx" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UploadExcelForm action={addDealerProgramLimits} />
        </CardContent>
      </Card>
    </>
  );
}
