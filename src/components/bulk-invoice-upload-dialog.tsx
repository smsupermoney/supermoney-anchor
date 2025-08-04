
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
import UploadExcelForm from "@/app/add-program/upload-excel-form";
import DownloadSampleExcel from "./download-sample-excel";
import { sampleBulkInvoices } from "@/lib/dummy-data";
import { sendBulkInvoiceEmail } from "@/app/dashboard/bulk-invoice-actions";

export default function BulkInvoiceUploadDialog() {
  const [open, setOpen] = useState(false);

  const handleSuccess = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Upload className="mr-2 h-4 w-4" />
          Bulk Invoice Upload
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Bulk Invoice Upload</DialogTitle>
          <DialogDescription className="flex justify-between items-center pt-1">
            <span>
              Upload an Excel file with invoice data based on the template.
            </span>
            <DownloadSampleExcel data={sampleBulkInvoices} fileName="sample-bulk-invoices.xlsx" />
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <UploadExcelForm action={sendBulkInvoiceEmail} onSuccess={handleSuccess} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
