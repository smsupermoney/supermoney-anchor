"use server";

import { db1 } from "@/lib/firebase";
import { collection, writeBatch, doc, getDocs, query } from "firebase/firestore";
import * as xlsx from 'xlsx';

type ActionResult = {
  message?: string;
  error?: string;
};

// GST validation regex: 15-digit alphanumeric
const gstRegex = /^[a-zA-Z0-9]{15}$/;

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

    // Fetch existing dealers to check for duplicates based on programId + GST
    const dealersRef = collection(db1, "dealers");
    const existingDealersSnapshot = await getDocs(query(dealersRef));
    const existingDealerKeys = new Set(
        existingDealersSnapshot.docs.map(doc => `${doc.data().programId}-${doc.data().GST}`)
    );
    const existingDealerAppIds = new Set(existingDealersSnapshot.docs.map(doc => doc.id));


    const batch = writeBatch(db1);
    let newEntriesCount = 0;
    let updatedEntriesCount = 0;
    let skippedEntriesCount = 0;
    const processedCompositeKeys = new Set<string>();

    for (const row of dataArray as any[]) {
        const dealerAppId = row.applicationId?.toString().trim();
        const gst = row.GST?.toString().trim();
        const programId = row.programId?.toString().trim();
        const anchorId = row.anchorId?.toString().trim();
        const region = row.region?.toString().trim();
        const emailAddress = row.emailAddress?.toString().trim();
        
        // New optional fields specifically for PROG011
        const branchName = row.branchName?.toString().trim() || '';
        const branchEmailId = row.branchEmailId?.toString().trim() || '';

        if (!dealerAppId) {
            console.warn("Skipping a row because applicationId is missing.", row);
            skippedEntriesCount++;
            continue;
        }

        if (!gst) {
            console.warn("Skipping a row because GST is missing.", row);
            skippedEntriesCount++;
            continue;
        }
        
        if (!anchorId) {
            console.warn("Skipping a row because anchorId is missing.", row);
            skippedEntriesCount++;
            continue;
        }

        if (!programId) {
            console.warn("Skipping a row because programId is missing.", row);
            skippedEntriesCount++;
            continue;
        }
        
        if (!gstRegex.test(gst)) {
            console.warn(`Skipping a row because GST is invalid: ${gst}`, row);
            skippedEntriesCount++;
            continue;
        }

        const compositeKey = `${programId}-${gst}`;
        if (processedCompositeKeys.has(compositeKey)) {
             console.warn(`Skipping a duplicate row found in the Excel file itself: ${compositeKey}`, row);
             skippedEntriesCount++;
             continue;
        }
        
        const isUpdate = existingDealerAppIds.has(dealerAppId);

        // Even if it's an update, we must check if the new composite key conflicts.
        if (!isUpdate && existingDealerKeys.has(compositeKey)) {
             console.warn(`Skipping a row because the combination of programId and GST already exists in the database: ${compositeKey}`, row);
             skippedEntriesCount++;
             continue;
        }
        
        processedCompositeKeys.add(compositeKey);

        const customerId = row.customerId?.toString();
        
        if (!customerId) {
            console.warn("Skipping a row because customerId is missing.", row);
            skippedEntriesCount++;
            continue;
        }

        // 1. Prepare data for the 'dealers' collection
        const dealerRef = doc(db1, "dealers", dealerAppId);
        const dealerName = row.dealerName || '';
        const dealerData: any = {
          dealerId: dealerAppId,
          customerId: customerId,
          applicationId: dealerAppId,
          programId: programId,
          anchorId: anchorId,
          dealerName: dealerName,
          dealerName_lowercase: dealerName.toLowerCase(),
          status: row.status || 'Pending',
          GST: gst,
          branchName: branchName,
          branchEmailId: branchEmailId,
        };
        
        if (region) {
            dealerData.region = region;
        }

        if (emailAddress) {
            dealerData.emailAddress = emailAddress;
        }


        // 2. Prepare data for the 'dealerLimits' collection
        const limitRef = doc(db1, "dealerLimits", dealerAppId); 
        const limitData = {
          dealerId: dealerAppId,
          applicationId: dealerAppId,
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
    }
    
    if (newEntriesCount > 0 || updatedEntriesCount > 0) {
      await batch.commit();
    }

    let message = `${newEntriesCount} new dealer(s) added and ${updatedEntriesCount} dealer(s) updated successfully.`;
    if (skippedEntriesCount > 0) {
      message += ` ${skippedEntriesCount} entries were skipped due to missing/invalid fields or duplicates.`;
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
