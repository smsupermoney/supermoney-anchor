"use server";

import { db1 } from "@/lib/firebase";
import { collection, writeBatch, doc, getDoc } from "firebase/firestore";
import * as xlsx from 'xlsx';

type ActionResult = {
  message?: string;
  error?: string;
};

export async function updateDealerEmail(formData: FormData): Promise<ActionResult> {
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
    const notFoundIds: string[] = [];

    for (const row of dataArray as any[]) {
      const applicationId = row.applicationId?.toString().trim();
      const emailAddress = row.emailAddress?.toString().trim();

      if (!applicationId || !emailAddress) {
        skippedCount++;
        continue;
      }

      const dealerDocRef = doc(db1, "dealers", applicationId);
      const docSnap = await getDoc(dealerDocRef);

      if (docSnap.exists()) {
        batch.update(dealerDocRef, { emailAddress: emailAddress });
        updatedCount++;
      } else {
        notFoundIds.push(applicationId);
      }
    }
    
    if (updatedCount > 0) {
      await batch.commit();
    }

    let message = `${updatedCount} dealer email(s) were updated successfully.`;
    if (skippedCount > 0) {
      message += ` ${skippedCount} rows were skipped due to missing data.`;
    }

    if (notFoundIds.length > 0) {
        const errorDetail = `The following applicationIds were not found in the database: ${notFoundIds.join(", ")}.`;
        if (updatedCount > 0 || skippedCount > 0) {
             return { message: message, error: errorDetail };
        }
        return { error: errorDetail };
    }
    
    return { message };
  } catch (error) {
    console.error("Error processing Excel file or writing to Firestore:", error);
    if (error instanceof Error) {
        return { error: `Failed to process file: ${error.message}.` };
    }
    return { error: "An unknown error occurred during the upload process." };
  }
}
