
"use server";

import { db } from "@/lib/firebase";
import { collection, writeBatch, doc } from "firebase/firestore";
import * as xlsx from 'xlsx';

type ActionResult = {
  message?: string;
  error?: string;
};

// Helper to convert Excel serial date to JS Date
function excelSerialDateToJSDate(serial: number): Date {
  const utc_days  = Math.floor(serial - 25569);
  const utc_value = utc_days * 86400;                                        
  const date_info = new Date(utc_value * 1000);

  const fractional_day = serial - Math.floor(serial) + 0.0000001;

  let total_seconds = Math.floor(86400 * fractional_day);

  const seconds = total_seconds % 60;
  total_seconds -= seconds;

  const hours = Math.floor(total_seconds / (60 * 60));
  const minutes = Math.floor(total_seconds / 60) % 60;

  return new Date(date_info.getFullYear(), date_info.getMonth(), date_info.getDate(), hours, minutes, seconds);
}

// Helper to format date to YYYY-MM-DD
function formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
}

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
    const invoicesArray = xlsx.utils.sheet_to_json(sheet, { raw: false });

    if (!Array.isArray(invoicesArray) || invoicesArray.length === 0) {
      return { error: "The Excel file is empty or not in the correct format." };
    }

    const batch = writeBatch(db);

    invoicesArray.forEach((invoice: any) => {
        const docRef = invoice.id ? doc(db, "invoices", invoice.id.toString()) : doc(collection(db, "invoices"));
        
        const invoiceData = {...invoice};
        if (invoiceData.id) {
            delete invoiceData.id;
        }

        // Ensure numeric fields are numbers
        if (invoiceData.amount) invoiceData.amount = Number(invoiceData.amount);
        if (invoiceData.overdueAmount) invoiceData.overdueAmount = Number(invoiceData.overdueAmount);

        // Dates will likely be parsed as strings from sheet_to_json with raw:false
        // No special handling needed if they are already in YYYY-MM-DD format in excel
        
        batch.set(docRef, invoiceData);
    });
    
    await batch.commit();

    return { message: `${invoicesArray.length} invoice(s) added successfully from the Excel file.` };
  } catch (error) {
    console.error("Error processing Excel file or writing to Firestore:", error);
    if (error instanceof Error) {
        return { error: `Failed to process file: ${error.message}` };
    }
    return { error: "An unknown error occurred during the upload process." };
  }
}
