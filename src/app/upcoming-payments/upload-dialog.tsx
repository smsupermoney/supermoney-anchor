
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import UploadExcelForm from "@/components/upload-excel-form";
import DownloadSampleExcel from "@/components/download-sample-excel";
import { addUpcomingPaymentsFromCsv } from "./actions";
import { useRouter } from "next/navigation";

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


export default function UploadUpcomingPaymentsDialog() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleSuccess = () => {
    setOpen(false);
    // Refresh the page to show the new data
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Upload className="mr-2 h-4 w-4" />
          Upload CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Bulk Upload Upcoming Payments</DialogTitle>
          <DialogDescription className="flex justify-between items-center pt-1">
            <span>
              Upload a CSV file with payment data based on the template.
            </span>
            <DownloadSampleExcel data={sampleData} fileName="sample-upcoming-payments.xlsx" />
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <UploadExcelForm action={addUpcomingPaymentsFromCsv} onSuccess={handleSuccess} buttonText="Upload Payments" />
        </div>
      </DialogContent>
    </Dialog>
  );
}
