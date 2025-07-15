
import PageHeader from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import UploadExcelForm from "../add-program/upload-excel-form";
import { addDealerProgramLimits } from "./actions";

export default function AddDealerLimitPage() {
  return (
    <>
      <PageHeader title="Add Dealer Limits (Bulk)" />
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Bulk Import Dealer-Program Limits</CardTitle>
          <CardDescription>
            Upload an Excel file with dealer-program limit data. The first sheet should contain a header row and rows with the limit information.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UploadExcelForm action={addDealerProgramLimits} />
        </CardContent>
      </Card>
    </>
  );
}
