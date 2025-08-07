
import PageHeader from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { addInvoices } from "./actions";
import UploadExcelForm from "@/components/upload-excel-form";
import DownloadSampleExcel from "@/components/download-sample-excel";
import { sampleInvoices } from "@/lib/dummy-data";


export default function AddInvoicePage() {
  return (
    <>
      <PageHeader title="Add New Invoices (Bulk)" />
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Bulk Import Invoices</CardTitle>
          <CardDescription className="flex justify-between items-center">
            <span>
                Upload an Excel file with invoice data. If invoiceNumber is a duplicate it will be skipped. If empty, a unique ID will be generated.
            </span>
            <DownloadSampleExcel data={sampleInvoices} fileName="sample-invoices.xlsx" />
          </CardDescription>
        </CardHeader>
        <CardContent>
            <UploadExcelForm action={addInvoices} />
        </CardContent>
      </Card>
    </>
  );
}
