
import PageHeader from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { addDealers } from "./actions";
import UploadExcelForm from "../add-program/upload-excel-form";
import DownloadSampleExcel from "@/components/download-sample-excel";
import { sampleDealers } from "@/lib/dummy-data";

export default function AddDealerPage() {
  return (
    <>
      <PageHeader title="Add New Dealers (Bulk)" />
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Bulk Import Dealers & Limits</CardTitle>
          <CardDescription className="flex justify-between items-center">
            <span>
              Upload an Excel file with dealer and limit data. The applicationId must be unique and will be used as the Dealer ID.
            </span>
             <DownloadSampleExcel data={sampleDealers} fileName="sample-dealers.xlsx" />
          </CardDescription>
        </CardHeader>
        <CardContent>
            <UploadExcelForm action={addDealers} />
        </CardContent>
      </Card>
    </>
  );
}
