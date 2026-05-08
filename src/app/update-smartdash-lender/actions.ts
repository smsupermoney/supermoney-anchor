"use server";

import { db1 } from "@/lib/firebase";
import { doc, getDoc, updateDoc, writeBatch } from "firebase/firestore";
import * as xlsx from 'xlsx';

type ActionResult = {
  message?: string;
  error?: string;
};

export async function bulkUpdateSmartdashLender(formData: FormData): Promise<ActionResult> {
  const file = formData.get('excel-file') as File;
  if (!file) return { error: "No file uploaded." };

  try {
    const bytes = await file.arrayBuffer();
    const workbook = xlsx.read(bytes, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet) as any[];

    if (data.length === 0) return { error: "Excel file is empty." };

    let updatedPrograms = 0;
    const batch = writeBatch(db1);

    for (const row of data) {
      const programId = row.programId?.toString().trim();
      const smartdashLender = row.SmartdashLender?.toString().trim();

      if (programId && smartdashLender) {
        const programRef = doc(db1, "programs", programId);
        const programSnap = await getDoc(programRef);
        
        if (programSnap.exists()) {
          batch.update(programRef, { SmartdashLender: smartdashLender });
          updatedPrograms++;
        }
      }
    }

    if (updatedPrograms > 0) {
      await batch.commit();
      return { message: `Successfully updated SmartdashLender for ${updatedPrograms} programs.` };
    } else {
      return { error: "No matching program IDs found in the database." };
    }
  } catch (e: any) {
    console.error("Bulk update lender error:", e);
    return { error: e.message || "An unknown error occurred during the update process." };
  }
}
