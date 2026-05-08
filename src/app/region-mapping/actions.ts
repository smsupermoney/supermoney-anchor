"use server";

import { db1 } from "@/lib/firebase";
import { collection, writeBatch, doc } from "firebase/firestore";
import * as xlsx from 'xlsx';

type ActionResult = {
  message?: string;
  error?: string;
};

export async function uploadRegionMappings(formData: FormData): Promise<ActionResult> {
  const file = formData.get('excel-file') as File;
  if (!file) return { error: "No file uploaded." };

  try {
    const bytes = await file.arrayBuffer();
    const workbook = xlsx.read(bytes, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet) as any[];

    if (data.length === 0) return { error: "File is empty." };

    const BATCH_LIMIT = 500;
    let successCount = 0;

    for (let i = 0; i < data.length; i += BATCH_LIMIT) {
      const chunk = data.slice(i, i + BATCH_LIMIT);
      const batch = writeBatch(db1);

      chunk.forEach((row) => {
        const id = `${row.city}-${row.state}`.toLowerCase().replace(/\s+/g, '-');
        const ref = doc(db1, "regionMapping", id);
        batch.set(ref, {
          city: row.city,
          state: row.state,
          region: row.region
        });
        successCount++;
      });

      await batch.commit();
    }

    return { message: `${successCount} mappings uploaded successfully.` };
  } catch (e: any) {
    return { error: e.message };
  }
}
