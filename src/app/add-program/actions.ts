
"use server";

import { db } from "@/lib/firebase";
import { collection, writeBatch, doc } from "firebase/firestore";
import * as xlsx from 'xlsx';

type ActionResult = {
  message?: string;
  error?: string;
};

export async function addPrograms(formData: FormData): Promise<ActionResult> {
  const file = formData.get('excel-file') as File;
  if (!file) {
    return { error: "No file uploaded." };
  }

  try {
    const bytes = await file.arrayBuffer();
    const workbook = xlsx.read(bytes, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const programsArray = xlsx.utils.sheet_to_json(sheet, {
        raw: true,
        // Convert boolean-like values
        transform: (value, header, R) => {
            if (typeof value === 'string') {
                if (value.toLowerCase() === 'true') return true;
                if (value.toLowerCase() === 'false') return false;
            }
            return value;
        }
    });

    if (!Array.isArray(programsArray) || programsArray.length === 0) {
      return { error: "The Excel file is empty or not in the correct format." };
    }

    const batch = writeBatch(db);

    programsArray.forEach((program: any) => {
      const docRef = program.id ? doc(db, "programs", program.id.toString()) : doc(collection(db, "programs"));
      
      const programData = { ...program };
      if (programData.id) {
        delete programData.id;
      }

      // Convert array-like strings to actual arrays
      if (typeof programData.anchorIds === 'string') {
          programData.anchorIds = programData.anchorIds.split(',').map((s:string) => s.trim());
      }
      
      batch.set(docRef, programData);
    });
    
    await batch.commit();

    return { message: `${programsArray.length} program(s) added successfully from the Excel file.` };
  } catch (error) {
    console.error("Error processing Excel file or writing to Firestore:", error);
    if (error instanceof Error) {
        return { error: `Failed to process file: ${error.message}` };
    }
    return { error: "An unknown error occurred during the upload process." };
  }
}
