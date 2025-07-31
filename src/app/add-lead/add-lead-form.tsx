
"use client";

import { addMomentumLeads } from "@/app/add-leads-bulk/actions";
import DownloadSampleExcel from "@/components/download-sample-excel";
import UploadExcelForm from "@/app/add-program/upload-excel-form";
import { sampleMomentumLeads } from "@/lib/dummy-data";

export default function AddLeadForm() {
    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <DownloadSampleExcel data={sampleMomentumLeads} fileName="sample-momentum-leads.xlsx" />
            </div>
            <UploadExcelForm action={addMomentumLeads} />
        </div>
    );
}
