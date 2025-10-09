
"use server";

import { db1 } from "@/lib/firebase";
import { writeBatch, doc } from "firebase/firestore";
import * as xlsx from 'xlsx';

type ActionResult = {
  message?: string;
  error?: string;
};

export async function updateDealerZone(formData: FormData): Promise<ActionResult> {
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

    const batch = writeBatch(db1);
    let updatedCount = 0;
    let skippedCount = 0;

    for (const row of dataArray as any[]) {
      const applicationId = row.applicationId?.toString().trim();
      const zone = row.zone?.toString().trim();

      if (!applicationId || !zone) {
        skippedCount++;
        continue;
      }

      // The document ID in the 'dealers' collection is the dealer's `applicationId`.
      const dealerDocRef = doc(db1, "dealers", applicationId);
      
      batch.update(dealerDocRef, { zone: zone });
      updatedCount++;
    }
    
    if (updatedCount > 0) {
      await batch.commit();
    }

    let message = `${updatedCount} dealer(s) were updated successfully.`;
    if (skippedCount > 0) {
      message += ` ${skippedCount} rows were skipped due to missing data.`;
    }
    
    return { message };
  } catch (error) {
    console.error("Error processing Excel file or writing to Firestore:", error);
    if (error instanceof Error) {
        return { error: `Failed to process file: ${error.message}. Make sure all applicationIds are correct.` };
    }
    return { error: "An unknown error occurred during the upload process. Some records may not have been updated." };
  }
}
