
"use server";

import { db1 } from "@/lib/firebase";
import { collection, writeBatch, doc, getDocs, query } from "firebase/firestore";
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

    // Fetch existing dealer IDs to prevent duplicates
    const dealersRef = collection(db1, "dealers");
    const existingDealersSnapshot = await getDocs(query(dealersRef));
    const existingDealerIds = new Set(existingDealersSnapshot.docs.map(doc => doc.id));

    const batch = writeBatch(db1);
    let newEntriesCount = 0;
    let updatedEntriesCount = 0;
    let skippedEntriesCount = 0;

    dataArray.forEach((row: any) => {
        const dealerId = row.applicationId?.toString();
        if (!dealerId) {
            console.warn("Skipping a row because applicationId is missing.", row);
            skippedEntriesCount++;
            return;
        }

        const isUpdate = existingDealerIds.has(dealerId);
        
        const customerId = row.customerId?.toString();
        const programId = row.programId?.toString();

        if (!customerId || !programId) {
            console.warn("Skipping a row because customerId or programId is missing.", row);
            skippedEntriesCount++;
            return;
        }

        // 1. Prepare data for the 'dealers' collection
        const dealerRef = doc(db1, "dealers", dealerId);
        const dealerData = {
          dealerId: dealerId,
          customerId: customerId,
          applicationId: dealerId,
          programId: programId,
          anchorId: row.anchorId || '',
          dealerName: row.dealerName || '',
          status: row.status || 'Pending',
        };

        // 2. Prepare data for the 'dealerLimits' collection
        const limitRef = doc(db1, "dealerLimits", dealerId); 
        const limitData = {
          dealerId: dealerId,
          applicationId: dealerId,
          limitAmount: Number(row.limitAmount) || 0,
          utilisationAmount: Number(row.utilisationAmount) || 0,
          availableAmount: Number(row.availableAmount) || 0,
          principalOverdue: Number(row.principalOverdue) || 0,
        };
        
        if (isUpdate) {
            batch.update(dealerRef, dealerData);
            batch.update(limitRef, limitData);
            updatedEntriesCount++;
        } else {
            batch.set(dealerRef, dealerData);
            batch.set(limitRef, limitData);
            newEntriesCount++;
        }
    });
    
    if (newEntriesCount > 0 || updatedEntriesCount > 0) {
      await batch.commit();
    }

    let message = `${newEntriesCount} new dealer(s) added and ${updatedEntriesCount} dealer(s) updated successfully.`;
    if (skippedEntriesCount > 0) {
      message += ` ${skippedEntriesCount} entries were skipped due to missing required fields.`;
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
