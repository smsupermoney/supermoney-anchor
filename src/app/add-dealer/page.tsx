
import PageHeader from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { addDealers } from "./actions";
import UploadExcelForm from "../add-program/upload-excel-form";

export default function AddDealerPage() {
  return (
    <>
      <PageHeader title="Add New Dealers (Bulk)" />
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Bulk Import Dealers</CardTitle>
          <CardDescription>
            Upload an Excel file with dealer data. The first sheet should contain a header row and rows with dealer information.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <UploadExcelForm action={addDealers} />
        </CardContent>
      </Card>
    </>
  );
}
