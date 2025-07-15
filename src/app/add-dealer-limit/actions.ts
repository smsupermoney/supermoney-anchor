
"use server";

import { db } from "@/lib/firebase";
import { collection, writeBatch, doc } from "firebase/firestore";
import * as xlsx from 'xlsx';

type ActionResult = {
  message?: string;
  error?: string;
};

export async function addDealerProgramLimits(formData: FormData): Promise<ActionResult> {
  const file = formData.get('excel-file') as File;
  if (!file) {
    return { error: "No file uploaded." };
  }

  try {
    const bytes = await file.arrayBuffer();
    const workbook = xlsx.read(bytes, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const limitsArray = xlsx.utils.sheet_to_json(sheet);

    if (!Array.isArray(limitsArray) || limitsArray.length === 0) {
      return { error: "The Excel file is empty or not in the correct format." };
    }

    const batch = writeBatch(db);

    limitsArray.forEach((limit: any) => {
        // Use the provided 'id' for the document ID, or let Firestore auto-generate one
        const docRef = limit.id ? doc(db, "dealerProgramLimits", limit.id.toString()) : doc(collection(db, "dealerProgramLimits"));
        
        const limitData = {...limit};
        if (limitData.id) {
            delete limitData.id;
        }

        // Ensure numeric fields are numbers
        if (limitData.creditLimit) limitData.creditLimit = Number(limitData.creditLimit);
        if (limitData.usedLimit) limitData.usedLimit = Number(limitData.usedLimit);
        
        batch.set(docRef, limitData);
    });
    
    await batch.commit();

    return { message: `${limitsArray.length} limit(s) added successfully from the Excel file.` };
  } catch (error) {
    console.error("Error processing Excel file or writing to Firestore:", error);
    if (error instanceof Error) {
        return { error: `Failed to process file: ${error.message}` };
    }
    return { error: "An unknown error occurred during the upload process." };
  }
}
