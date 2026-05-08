import PageHeader from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import UploadExcelForm from "@/components/upload-excel-form";
import { addPrograms } from "./actions";
import DownloadSampleExcel from "@/components/download-sample-excel";

const samplePrograms = [
    {
        programId: "PROG001",
        lenderName: "State Bank of India",
        shortName: "SBI",
        lenderType: "External",
        SmartdashLender: "SBI_MAPPING_1"
    }
];

export default function AddProgramPage() {
  return (
    <>
      <PageHeader title="Add New Programs (Bulk)" />
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Bulk Import Programs</CardTitle>
          <CardDescription className="flex justify-between items-center">
            <span>
              Upload an Excel file with program data. Include `SmartdashLender` column if mapping is required.
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
