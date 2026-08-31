
"use server";

import { db1 } from "@/lib/firebase";
import { writeBatch, doc, serverTimestamp } from "firebase/firestore";
import * as xlsx from 'xlsx';
import { z } from "zod";

type ActionResult = {
  message?: string;
  error?: string;
};

const upcomingPaymentRowSchema = z.object({
  dealerId: z.string().min(1, "dealerId is required"),
  loanId: z.string().min(1, "loanId is required"),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "dueDate must be YYYY-MM-DD"),
  outstandingAmount: z.number().nonnegative("outstandingAmount must be a non-negative number"),
});

export async function addUpcomingPaymentsFromCsv(formData: FormData): Promise<ActionResult> {
  const file = formData.get('excel-file') as File;
  if (!file) {
    return { error: "No file uploaded." };
  }

  try {
    const bytes = await file.arrayBuffer();
    const workbook = xlsx.read(bytes, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    // Convert sheet to JSON, ensuring header names are consistent.
    const dataArray: any[] = xlsx.utils.sheet_to_json(sheet);

    if (!Array.isArray(dataArray) || dataArray.length === 0) {
      return { error: "The CSV file is empty or not in the correct format." };
    }
    
    const BATCH_LIMIT = 25;
    let successfulEntries = 0;
    let skippedEntries = 0;
    
    for (let i = 0; i < dataArray.length; i += BATCH_LIMIT) {
        const slice = dataArray.slice(i, i + BATCH_LIMIT);
        const batch = writeBatch(db1);

        for(const row of slice) {
            // Standardize headers (e.g. "Dealer ID" -> "dealerId")
            const standardizedRow = {
                dealerId: row.dealerId || row["Dealer ID"],
                loanId: row.loanId || row["Loan ID"],
                dueDate: row.dueDate || row["Due Date"],
                outstandingAmount: row.outstandingAmount || row["Outstanding Amount"]
            };

            const validated = upcomingPaymentRowSchema.safeParse({
                ...standardizedRow,
                outstandingAmount: Number(standardizedRow.outstandingAmount)
            });

            if (!validated.success) {
                console.warn("Skipping invalid row:", standardizedRow, validated.error.flatten().fieldErrors);
                skippedEntries++;
                continue;
            }
            
            const { dealerId, loanId, dueDate, outstandingAmount } = validated.data;
            
            // Ensure parent dealer doc exists for subcollection writes
            const dealerRef = doc(db1, 'upcomingPayments', dealerId);
            batch.set(dealerRef, {
                dealerId: dealerId,
                updatedAt: serverTimestamp(),
            }, { merge: true });

            const loanRef = doc(db1, 'upcomingPayments', dealerId, 'loans', loanId);

            if (outstandingAmount === 0) {
                batch.delete(loanRef);
            } else {
                batch.set(loanRef, {
                    loanId: loanId,
                    dueDate: dueDate,
                    outstandingAmount: outstandingAmount,
                    updatedAt: serverTimestamp(),
                }, { merge: true });
            }
            successfulEntries++;
        }
        await batch.commit();
    }
    
    let message = `${successfulEntries} payment records processed successfully.`;
    if (skippedEntries > 0) {
        message += ` ${skippedEntries} records were skipped due to invalid data.`
    }

    return { message };

  } catch (error) {
    console.error("Error processing CSV file or writing to Firestore:", error);
    if (error instanceof Error) {
        return { error: `Failed to process file: ${error.message}` };
    }
    return { error: "An unknown error occurred during the upload process." };
  }
}

    