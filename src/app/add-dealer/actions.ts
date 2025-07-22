
"use server";

import { db1 } from "@/lib/firebase";
import { collection, writeBatch, doc, getDocs } from "firebase/firestore";
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
    const dealersArray = xlsx.utils.sheet_to_json(sheet);

    if (!Array.isArray(dealersArray) || dealersArray.length === 0) {
      return { error: "The Excel file is empty or not in the correct format." };
    }

    // Fetch existing dealer IDs to prevent duplicates
    const dealersRef = collection(db1, "dealers");
    const existingDealersSnapshot = await getDocs(dealersRef);
    const existingDealerIds = new Set(existingDealersSnapshot.docs.map(doc => doc.id));

    const batch = writeBatch(db1);
    let newDealersCount = 0;
    let skippedDealersCount = 0;

    dealersArray.forEach((dealer: any) => {
        const dealerId = dealer.dealerId?.toString();
        if (!dealerId) {
            console.warn("Skipping a row because dealerId is missing.", dealer);
            skippedDealersCount++;
            return;
        }

        if (existingDealerIds.has(dealerId)) {
            console.warn(`Skipping duplicate dealerId: ${dealerId}`);
            skippedDealersCount++;
            return;
        }

        const docRef = doc(db1, "dealers", dealerId);

        // Map excel columns to firestore fields
        const dealerData = {
          programId: dealer.programId || '',
          lenderName: dealer.lenderName || '',
          product: dealer.product || '',
          tradeName: dealer.tradeName || '',
          anchorId: dealer.anchorId || '',
          status: dealer.status || 'Pending',
          // Use tradeName for name field if it exists, otherwise default to empty
          name: dealer.tradeName || ''
        };
        
        batch.set(docRef, dealerData);
        newDealersCount++;
    });
    
    if (newDealersCount > 0) {
      await batch.commit();
    }

    let message = `${newDealersCount} new dealer(s) added successfully.`;
    if (skippedDealersCount > 0) {
      message += ` ${skippedDealersCount} dealer(s) were skipped due to missing IDs or being duplicates.`;
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
