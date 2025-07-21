
"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { addMomentumLeads } from "@/app/add-leads-bulk/actions";
import UploadExcelForm from "@/app/add-program/upload-excel-form";
import DownloadSampleExcel from "./download-sample-excel";
import { sampleMomentumLeads } from "@/lib/dummy-data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

type BulkLeadUploadDialogProps = {
  children: React.ReactNode;
};

export default function BulkLeadUploadDialog({ children }: BulkLeadUploadDialogProps) {
  const [open, setOpen] = React.useState(false);

  // We can pass a success callback to the form to close the dialog
  const onUploadSuccess = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Bulk Import Leads</DialogTitle>
          <DialogDescription className="flex justify-between items-center pt-1">
            <span>
              Upload an Excel file with lead data.
            </span>
             <DownloadSampleExcel data={sampleMomentumLeads} fileName="sample-momentum-leads.xlsx" />
          </DialogDescription>
        </DialogHeader>
        <div className="pt-4">
            <UploadExcelForm action={addMomentumLeads} onSuccess={onUploadSuccess} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
