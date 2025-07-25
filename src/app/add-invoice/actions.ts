
"use server";

import { db1 } from "@/lib/firebase";
import { collection, writeBatch, doc, getDocs, query } from "firebase/firestore";
import * as xlsx from 'xlsx';
import type { Invoice, InvoiceStatus } from "@/types";

type ActionResult = {
  message?: string;
  error?: string;
};

export async function addInvoices(formData: FormData): Promise<ActionResult> {
  const file = formData.get('excel-file') as File;
  if (!file) {
    return { error: "No file uploaded." };
  }

  try {
    const bytes = await file.arrayBuffer();
    const workbook = xlsx.read(bytes, { type: "buffer", cellDates: true });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    // Use { raw: false } to get formatted text for dates
    const rawDataArray = xlsx.utils.sheet_to_json(sheet, { raw: false });

    // Filter out empty rows that might be read by the xlsx library
    const invoicesArray = rawDataArray.filter((row: any) => 
        Object.values(row).some(cell => cell !== null && cell !== '')
    );

    if (!Array.isArray(invoicesArray) || invoicesArray.length === 0) {
      return { error: "The Excel file is empty or not in the correct format." };
    }

    // Fetch existing invoice numbers to prevent duplicates
    const invoicesRef = collection(db1, "invoices");
    const existingInvoicesSnapshot = await getDocs(query(invoicesRef));
    const existingInvoiceNumbers = new Set(existingInvoicesSnapshot.docs.map(doc => doc.id));

    const batch = writeBatch(db1);
    let newEntriesCount = 0;
    let skippedEntriesCount = 0;

    invoicesArray.forEach((row: any) => {
        let invoiceNumber = row.invoiceNumber?.toString();

        if (invoiceNumber && existingInvoiceNumbers.has(invoiceNumber)) {
            console.warn(`Skipping duplicate invoiceNumber: ${invoiceNumber}`);
            skippedEntriesCount++;
            return;
        }

        // If invoiceNumber is empty, generate a unique one
        if (!invoiceNumber) {
            invoiceNumber = doc(collection(db1, "invoices")).id;
        }

        const docRef = doc(db1, "invoices", invoiceNumber);

        // Map excel columns to our Invoice type
        const invoiceData: Partial<Invoice> = {
            invoiceNumber: invoiceNumber,
            programId: row.programId?.toString() || '',
            anchorId: row.anchorId?.toString() || '',
            dealerId: row.dealerId?.toString() || '',
            date: row.date || new Date().toISOString().split('T')[0],
            dueDate: row.dueDate || new Date().toISOString().split('T')[0],
            amount: Number(row.invoiceAmount) || 0,
            disbursementSentAmount: Number(row.disbursementSentAmount) || 0,
            status: (row.status || 'Initiated') as InvoiceStatus,
            remarks: row.remarks || '',
            utrNo: row.utrNo?.toString() || ''
        };
        
        batch.set(docRef, invoiceData);
        newEntriesCount++;
    });
    
    if (newEntriesCount > 0) {
        await batch.commit();
    }

    let message = `${newEntriesCount} new invoice(s) added successfully.`;
    if (skippedEntriesCount > 0) {
        message += ` ${skippedEntriesCount} invoice(s) were skipped due to duplicate invoice numbers.`;
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
