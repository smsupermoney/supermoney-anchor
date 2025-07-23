
"use server";

import { db1 } from "@/lib/firebase";
import { collection, writeBatch, doc, getDocs } from "firebase/firestore";
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
    const programsArray = xlsx.utils.sheet_to_json(sheet);

    if (!Array.isArray(programsArray) || programsArray.length === 0) {
      return { error: "The Excel file is empty or not in the correct format." };
    }

    // Fetch existing program IDs to prevent duplicates
    const programsRef = collection(db1, "programs");
    const existingProgramsSnapshot = await getDocs(programsRef);
    const existingProgramIds = new Set(existingProgramsSnapshot.docs.map(doc => doc.id));

    const batch = writeBatch(db1);
    let newProgramsCount = 0;
    let skippedProgramsCount = 0;

    programsArray.forEach((program: any) => {
        const programId = program.programId?.toString();
        if (!programId) {
            console.warn("Skipping a row because programId is missing.", program);
            skippedProgramsCount++;
            return;
        }

        if (existingProgramIds.has(programId)) {
            console.warn(`Skipping duplicate programId: ${programId}`);
            skippedProgramsCount++;
            return;
        }

        const docRef = doc(db1, "programs", programId);

        const programData = {
          programId: programId,
          lenderName: program.lenderName || '',
          lenderType: program.lenderType || '',
          // anchorIds is no longer directly imported but can be managed elsewhere
        };
        
        batch.set(docRef, programData);
        newProgramsCount++;
    });
    
    if (newProgramsCount > 0) {
      await batch.commit();
    }
    
    let message = `${newProgramsCount} new program(s) added successfully.`;
    if (skippedProgramsCount > 0) {
      message += ` ${skippedProgramsCount} program(s) were skipped due to missing or duplicate IDs.`;
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
