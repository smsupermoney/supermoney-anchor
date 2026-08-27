"use server";

import { db1 } from "@/lib/firebase";
import { collection, query, where, getDocs, writeBatch } from "firebase/firestore";
import * as xlsx from 'xlsx';

type ActionResult = {
  message?: string;
  error?: string;
};

export async function bulkUpdateSmartdashCompany(formData: FormData): Promise<ActionResult> {
  const file = formData.get('excel-file') as File;
  if (!file) return { error: "No file uploaded." };

  try {
    const bytes = await file.arrayBuffer();
    const workbook = xlsx.read(bytes, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet) as any[];

    let updatedAnchors = 0;
    let totalUsersUpdated = 0;

    for (const row of data) {
      if (row.externalId && row.SmartdashCompanyName) {
        const q = query(collection(db1, "users"), where("externalId", "==", row.externalId.toString()));
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
          const batch = writeBatch(db1);
          snapshot.forEach((doc) => {
            batch.update(doc.ref, { SmartdashCompanyName: row.SmartdashCompanyName });
            totalUsersUpdated++;
          });
          await batch.commit();
          updatedAnchors++;
        }
      }
    }

    return { message: `Updated company name for ${updatedAnchors} anchors (${totalUsersUpdated} users in total).` };
  } catch (e: any) {
    return { error: e.message };
  }
}
