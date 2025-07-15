
import PageHeader from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import UploadExcelForm from "./upload-excel-form";
import { addPrograms } from "./actions";

export default function AddProgramPage() {
  return (
    <>
      <PageHeader title="Add New Programs (Bulk)" />
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Bulk Import Programs</CardTitle>
          <CardDescription>
            Upload an Excel file with program data. The first sheet should contain a header row and rows with program information.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UploadExcelForm action={addPrograms} />
        </CardContent>
      </Card>
    </>
  );
}
