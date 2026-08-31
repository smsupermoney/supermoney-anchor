
import PageHeader from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import UploadExcelForm from "@/components/upload-excel-form";
import { addUpcomingPaymentsFromCsv } from "./actions";
import DownloadSampleExcel from "@/components/download-sample-excel";

const sampleData = [
    {
        dealerId: "DLR001",
        loanId: "LOAN001",
        dueDate: "2024-09-15",
        outstandingAmount: 75000,
    },
     {
        dealerId: "DLR002",
        loanId: "LOAN002",
        dueDate: "2024-09-20",
        outstandingAmount: 120000,
    }
];

export default function AddUpcomingPaymentsPage() {
  return (
    <>
      <PageHeader title="Add Upcoming Payments (Bulk)" />
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Bulk Import Upcoming Payments</CardTitle>
          <CardDescription className="flex justify-between items-center">
            <span>
              Upload an Excel file with upcoming payment data.
            </span>
            <DownloadSampleExcel data={sampleData} fileName="sample-upcoming-payments.xlsx" />
          </CardDescription>
        </CardHeader>
        <CardContent>
            <UploadExcelForm action={addUpcomingPaymentsFromCsv} buttonText="Upload Payments" />
        </CardContent>
      </Card>
    </>
  );
}
