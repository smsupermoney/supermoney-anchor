
import PageHeader from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import UploadExcelForm from "@/components/upload-excel-form";
import { updateDealerRegion } from "./actions";
import DownloadSampleExcel from "@/components/download-sample-excel";
import { sampleRegionUpdate } from "@/lib/dummy-data";

export default function UpdateRegionPage() {
  return (
    <>
      <PageHeader title="Update Dealer Region" />
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Bulk Update Dealer Regions</CardTitle>
          <CardDescription className="flex justify-between items-center">
            <span>
              Upload an Excel file with `applicationId` and `region` columns. The region will be updated for the matching dealer.
            </span>
             <DownloadSampleExcel data={sampleRegionUpdate} fileName="sample-region-update.xlsx" />
          </CardDescription>
        </CardHeader>
        <CardContent>
            <UploadExcelForm action={updateDealerRegion} buttonText="Upload and Update Regions" />
        </CardContent>
      </Card>
    </>
  );
}
