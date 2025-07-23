
"use server";

import { db1 } from "@/lib/firebase";
import { collection, writeBatch, doc, getDocs, query, where, documentId } from "firebase/firestore";
import * as xlsx from 'xlsx';

type ActionResult = {
  message?: string;
  error?: string;
};

export async function addDealers(formData: FormData): Promise<ActionResult> {
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

    // Fetch existing application IDs to prevent duplicates in dealerProgramLimits
    const limitsRef = collection(db1, "dealerProgramLimits");
    const existingLimitsSnapshot = await getDocs(query(limitsRef));
    const existingApplicationIds = new Set(existingLimitsSnapshot.docs.map(doc => doc.data().applicationId));

    const batch = writeBatch(db1);
    let newEntriesCount = 0;
    let skippedEntriesCount = 0;

    dataArray.forEach((row: any) => {
        const applicationId = row.applicationId?.toString();
        if (!applicationId) {
            console.warn("Skipping a row because applicationId is missing.", row);
            skippedEntriesCount++;
            return;
        }

        if (existingApplicationIds.has(applicationId)) {
            console.warn(`Skipping duplicate applicationId: ${applicationId}`);
            skippedEntriesCount++;
            return;
        }
        
        const dealerId = row.customerId?.toString();
        const programId = row.programId?.toString();

        if (!dealerId || !programId) {
            console.warn("Skipping a row because customerId or programId is missing.", row);
            skippedEntriesCount++;
            return;
        }

        // 1. Prepare data for the 'dealers' collection
        const dealerRef = doc(db1, "dealers", dealerId);
        const dealerData = {
          id: dealerId,
          name: row.dealerName || '',
          anchorId: row.anchorId || '',
          programId: programId,
          status: 'Active', // Default status
        };
        // Use `set` with merge:true to create or update the dealer info without overwriting unrelated fields
        batch.set(dealerRef, dealerData, { merge: true });

        // 2. Prepare data for the 'dealerProgramLimits' collection
        const limitRef = doc(collection(db1, "dealerProgramLimits")); // Auto-generate ID for this doc
        const limitData = {
          applicationId: applicationId,
          dealerId: dealerId,
          programId: programId,
          creditLimit: Number(row.limitAmount) || 0,
          usedLimit: Number(row.utilisationAmount) || 0,
          availableAmount: Number(row.availableAmount) || 0,
          principalOverdue: Number(row.principalOverdue) || 0
        };
        batch.set(limitRef, limitData);

        newEntriesCount++;
    });
    
    if (newEntriesCount > 0) {
      await batch.commit();
    }

    let message = `${newEntriesCount} new dealer limit(s) added successfully.`;
    if (skippedEntriesCount > 0) {
      message += ` ${skippedEntriesCount} entries were skipped due to missing or duplicate Application IDs.`;
    }

    return { message };
  } catch (error) {
    console.error("Error processing Excel file or writing to Firestore:", error);
    if (error instanceof Error) {
        return { error: `Failed to process file: ${error.message}` };
    }
    return { error: "An unknown error occurred during the upload process." };
  }
}
