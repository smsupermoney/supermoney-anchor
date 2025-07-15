
import PageHeader from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { addInvoices } from "./actions";
import UploadExcelForm from "../add-program/upload-excel-form";

export default function AddInvoicePage() {
  return (
    <>
      <PageHeader title="Add New Invoices (Bulk)" />
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Bulk Import Invoices</CardTitle>
          <CardDescription>
            Upload an Excel file with invoice data. The first sheet should contain a header row and rows with invoice information.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <UploadExcelForm action={addInvoices} />
        </CardContent>
      </Card>
    </>
  );
}
