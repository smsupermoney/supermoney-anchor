
"use server";

import { requireAdmin } from "@/lib/auth";
import { db1 } from "@/lib/firebase";
import { collection, writeBatch, doc, getDocs, query, where } from "firebase/firestore";
import * as xlsx from 'xlsx';

type ActionResult = {
  message?: string;
  error?: string;
};

// GST validation regex: 15-digit alphanumeric
const gstRegex = /^[a-zA-Z0-9]{15}$/;

export async function updateDealerGst(formData: FormData): Promise<ActionResult> {
  const authError = await requireAdmin();
  if (authError) return authError;

  const file = formData.get('excel-file') as File;
  if (!file) {
    return { error: "No file uploaded." };
  }

  try {
    const bytes = await file.arrayBuffer();
    const workbook = xlsx.read(bytes, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const dataArray = xlsx.utils.sheet_to_json(sheet);

    if (!Array.isArray(dataArray) || dataArray.length === 0) {
      return { error: "The Excel file is empty or not in the correct format." };
    }

    const dealersRef = collection(db1, "dealers");
    const batch = writeBatch(db1);
    let updatedCount = 0;
    let skippedCount = 0;
    let notFoundCount = 0;

    for (const row of dataArray as any[]) {
      const applicationId = row.applicationId?.toString().trim();
      const gst = row.GST?.toString().trim();

      if (!applicationId || !gst) {
        skippedCount++;
        continue;
      }
      
      if (!gstRegex.test(gst)) {
        console.warn(`Skipping row due to invalid GST for applicationId ${applicationId}`);
        skippedCount++;
        continue;
      }

      // The document ID in the 'dealers' collection is the dealer's `applicationId`.
      const dealerDocRef = doc(db1, "dealers", applicationId);
      
      batch.update(dealerDocRef, { GST: gst });
      updatedCount++;
    }
    
    if (updatedCount > 0) {
      await batch.commit();
    }

    let message = `${updatedCount} dealer(s) were updated successfully.`;
    if (skippedCount > 0) {
      message += ` ${skippedCount} rows were skipped due to missing or invalid data.`;
    }
    
    return { message };
  } catch (error) {
    console.error("Error processing Excel file or writing to Firestore:", error);
    if (error instanceof Error) {
        return { error: `Failed to process file: ${error.message}` };
    }
    return { error: "An unknown error occurred during the upload process. Some records may not have been updated." };
  }
}
