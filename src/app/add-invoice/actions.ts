
"use server";

import { db1 } from "@/lib/firebase";
import { collection, writeBatch, doc, getDocs, query, where, limit } from "firebase/firestore";
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

    const batch = writeBatch(db1);
    let newEntriesCount = 0;
    let updatedEntriesCount = 0;
    const invoicesRef = collection(db1, "invoices");

    // Process invoices sequentially to handle checks correctly
    for (const row of invoicesArray) {
        const invoiceNumber = row.invoiceNumber?.toString().trim();

        if (!invoiceNumber || invoiceNumber.toLowerCase() === 'not applicable') {
            // If no invoice number, create a new doc with a unique ID
            const newDocRef = doc(invoicesRef);
            const invoiceData: Partial<Invoice> = {
                // id will be newDocRef.id, but we don't set it explicitly in the data
                invoiceNumber: newDocRef.id, // Use the generated ID as the invoice number if none provided
                programId: row.programId?.toString() || '',
                anchorId: row.anchorId?.toString() || '',
                dealerId: row.dealerId?.toString() || '',
                date: row.date || new Date().toISOString().split('T')[0],
                dueDate: row.dueDate || new Date().toISOString().split('T')[0],
                disburseDate: row.disburseDate || '',
                amount: Number(row.invoiceAmount) || 0,
                disbursementSentAmount: Number(row.disbursementSentAmount) || 0,
                status: (row.status || 'Initiated') as InvoiceStatus,
                remarks: row.remarks || '',
                utrNo: row.utrNo?.toString() || ''
            };
            batch.set(newDocRef, invoiceData);
            newEntriesCount++;
        } else {
            // Check if an invoice with this invoiceNumber field already exists
            const q = query(invoicesRef, where("invoiceNumber", "==", invoiceNumber), limit(1));
            const existingInvoiceSnapshot = await getDocs(q);

            const invoiceData: Partial<Invoice> = {
                invoiceNumber: invoiceNumber,
                programId: row.programId?.toString() || '',
                anchorId: row.anchorId?.toString() || '',
                dealerId: row.dealerId?.toString() || '',
                date: row.date || new Date().toISOString().split('T')[0],
                dueDate: row.dueDate || new Date().toISOString().split('T')[0],
                disburseDate: row.disburseDate || '',
                amount: Number(row.invoiceAmount) || 0,
                disbursementSentAmount: Number(row.disbursementSentAmount) || 0,
                status: (row.status || 'Initiated') as InvoiceStatus,
                remarks: row.remarks || '',
                utrNo: row.utrNo?.toString() || ''
            };
            
            if (!existingInvoiceSnapshot.empty) {
                // Update existing invoice
                const existingDocRef = existingInvoiceSnapshot.docs[0].ref;
                batch.update(existingDocRef, invoiceData);
                updatedEntriesCount++;
            } else {
                // Create new invoice
                const newDocRef = doc(invoicesRef); // Generate a unique ID
                batch.set(newDocRef, invoiceData);
                newEntriesCount++;
            }
        }
    }
    
    if (newEntriesCount > 0 || updatedEntriesCount > 0) {
        await batch.commit();
    }

    let message = `${newEntriesCount} new invoice(s) added and ${updatedEntriesCount} existing invoice(s) updated successfully.`;
    
    return { message };
  } catch (error) {
    console.error("Error processing Excel file or writing to Firestore:", error);
    if (error instanceof Error) {
        return { error: `Failed to process file: ${error.message}` };
    }
    return { error: "An unknown error occurred during the upload process." };
  }
}
