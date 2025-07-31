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
import { addMomentumLeads } from "@/app/add-leads-bulk/actions";
import DownloadSampleExcel from "./download-sample-excel";
import { sampleMomentumLeads } from "@/lib/dummy-data";
import { useRouter } from "next/navigation";

export default function BulkLeadUploadDialog() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleSuccess = () => {
    setOpen(false);
    // Refresh the page to show the new leads
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Upload className="mr-2 h-4 w-4" />
          Bulk Lead Upload
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Bulk Import Leads</DialogTitle>
          <DialogDescription className="flex justify-between items-center pt-1">
            <span>
              Upload an Excel file with lead data based on the template.
            </span>
            <DownloadSampleExcel data={sampleMomentumLeads} fileName="sample-momentum-leads.xlsx" />
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <UploadExcelForm action={addMomentumLeads} onSuccess={handleSuccess} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
