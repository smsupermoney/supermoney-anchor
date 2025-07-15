
"use server";

import { db } from "@/lib/firebase";
import { collection, writeBatch, doc } from "firebase/firestore";
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

    const batch = writeBatch(db);

    dealersArray.forEach((dealer: any) => {
        const docRef = dealer.id ? doc(db, "dealers", dealer.id.toString()) : doc(collection(db, "dealers"));
        
        const dealerData = {...dealer};
        if (dealerData.id) {
            delete dealerData.id;
        }
        
        batch.set(docRef, dealerData);
    });
    
    await batch.commit();

    return { message: `${dealersArray.length} dealer(s) added successfully from the Excel file.` };
  } catch (error) {
    console.error("Error processing Excel file or writing to Firestore:", error);
    if (error instanceof Error) {
        return { error: `Failed to process file: ${error.message}` };
    }
    return { error: "An unknown error occurred during the upload process." };
  }
}
