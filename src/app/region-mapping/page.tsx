import PageHeader from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import UploadExcelForm from "@/components/upload-excel-form";
import DownloadSampleExcel from "@/components/download-sample-excel";
import { uploadRegionMappings } from "./actions";

const sampleData = [
  { city: "Mumbai", state: "Maharashtra", region: "West" },
  { city: "Delhi", state: "Delhi", region: "North" }
];

export default function RegionMappingPage() {
  return (
    <>
      <PageHeader title="Region Mapping" />
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Upload City/State Mappings</CardTitle>
          <CardDescription className="flex justify-between items-center">
            <span>Upload mappings of cities and states to specific regions.</span>
            <DownloadSampleExcel data={sampleData} fileName="region-mappings.xlsx" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UploadExcelForm action={uploadRegionMappings} buttonText="Upload Mappings" />
        </CardContent>
      </Card>
    </>
  );
}
