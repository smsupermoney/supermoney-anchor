import PageHeader from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { addDealers } from "./actions";
import UploadExcelForm from "@/components/upload-excel-form";
import DownloadSampleExcel from "@/components/download-sample-excel";
import { sampleDealers } from "@/lib/dummy-data";

export default function AddDealerPage() {
  return (
    <>
      <PageHeader title="Add New Dealers (Bulk)" />
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Bulk Import Dealers & Limits</CardTitle>
          <CardDescription className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span>
                Upload an Excel file. `GST` and `anchorId` are mandatory. The combination of `anchorId` and `GST` must be unique.
              </span>
               <DownloadSampleExcel data={sampleDealers} fileName="sample-dealers.xlsx" />
            </div>
            <div className="text-sm text-muted-foreground p-2 bg-secondary/50 rounded-md border border-border">
              <strong>Note for Program PROG011:</strong> You can optionally include `branchName` and `branchEmailId` columns in your Excel file for this program.
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
            <UploadExcelForm action={addDealers} />
        </CardContent>
      </Card>
    </>
  );
}