
import PageHeader from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import UploadExcelForm from "@/components/upload-excel-form";
import { updateDealerZone } from "./actions";
import DownloadSampleExcel from "@/components/download-sample-excel";
import { sampleZoneUpdate } from "@/lib/dummy-data";

export default function UpdateZonePage() {
  return (
    <>
      <PageHeader title="Update Dealer Zone" />
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Bulk Update Dealer Zones</CardTitle>
          <CardDescription className="flex justify-between items-center">
            <span>
              Upload an Excel file with `applicationId` and `zone` columns. The zone will be updated for the matching dealer.
            </span>
             <DownloadSampleExcel data={sampleZoneUpdate} fileName="sample-zone-update.xlsx" />
          </CardDescription>
        </CardHeader>
        <CardContent>
            <UploadExcelForm action={updateDealerZone} buttonText="Upload and Update Zones" />
        </CardContent>
      </Card>
    </>
  );
}
