
"use client";

import { addMomentumLeads } from "@/app/add-leads-bulk/actions";
import DownloadSampleExcel from "@/components/download-sample-excel";
import UploadExcelForm from "@/app/add-program/upload-excel-form";
import { sampleMomentumLeads } from "@/lib/dummy-data";

export default function AddLeadForm() {
    // This component might be repurposed for a single lead entry form in the future.
    // For now, it's not directly used as bulk upload is handled via a dialog.
    return (
        <div className="space-y-4">
           <p className="text-muted-foreground">Single lead creation form will be here.</p>
        </div>
    );
}
