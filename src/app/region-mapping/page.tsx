import PageHeader from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import UploadExcelForm from "@/components/upload-excel-form";
import DownloadSampleExcel from "@/components/download-sample-excel";
import { uploadRegionMappings } from "./actions";

const sampleData = [
  { state: "Maharashtra", region: "West" },
  { state: "Delhi", region: "North" },
  { state: "Karnataka", region: "South" },
  { state: "West Bengal", region: "East" }
];

export default function RegionMappingPage() {
  return (
    <>
      <PageHeader title="Region Mapping" />
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Upload State Region Mappings</CardTitle>
          <CardDescription className="flex justify-between items-center">
            <span>Upload mappings of states to specific regions.</span>
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
