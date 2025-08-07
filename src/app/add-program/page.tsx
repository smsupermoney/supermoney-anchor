
import PageHeader from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import UploadExcelForm from "@/components/upload-excel-form";
import { addPrograms } from "./actions";
import DownloadSampleExcel from "@/components/download-sample-excel";
import { samplePrograms } from "@/lib/dummy-data";

export default function AddProgramPage() {
  return (
    <>
      <PageHeader title="Add New Programs (Bulk)" />
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Bulk Import Programs</CardTitle>
          <CardDescription className="flex justify-between items-center">
            <span>
              Upload an Excel file with program data. The programId must be unique.
            </span>
            <DownloadSampleExcel data={samplePrograms} fileName="sample-programs.xlsx" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UploadExcelForm action={addPrograms} />
        </CardContent>
      </Card>
    </>
  );
}
