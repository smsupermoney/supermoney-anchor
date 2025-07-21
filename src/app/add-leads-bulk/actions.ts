
"use server";

import { db2 } from "@/lib/firebase";
import { collection, writeBatch, doc } from "firebase/firestore";
import * as xlsx from 'xlsx';
import { getSession } from "@/lib/session";

type ActionResult = {
  message?: string;
  error?: string;
};

export async function addMomentumLeads(formData: FormData): Promise<ActionResult> {
  const file = formData.get('excel-file') as File;
  if (!file) {
    return { error: "No file uploaded." };
  }
  
  const session = await getSession();
  const anchorId = session?.externalId;

  if (!anchorId) {
      return { error: "Could not determine the anchor to associate leads with. Please log in again." };
  }

  try {
    const bytes = await file.arrayBuffer();
    const workbook = xlsx.read(bytes, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    // Use { raw: false } to get formatted text for dates, etc.
    const leadsArray = xlsx.utils.sheet_to_json(sheet, { raw: false });

    if (!Array.isArray(leadsArray) || leadsArray.length === 0) {
      return { error: "The Excel file is empty or not in the correct format." };
    }

    const batch = writeBatch(db2);

    leadsArray.forEach((lead: any) => {
        // Let Firestore auto-generate the document ID for new leads
        const docRef = doc(collection(db2, "dealers"));
        
        // Ensure required fields and defaults are set
        const leadData = {
            ...lead,
            anchorId: lead.anchorId || anchorId, // Use anchorId from file, or logged-in user's
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            leadDate: lead.leadDate ? new Date(lead.leadDate).toISOString() : new Date().toISOString(),
            initialLeadDate: lead.initialLeadDate ? new Date(lead.initialLeadDate).toISOString() : new Date().toISOString(),
            dealValue: lead.dealValue ? Number(lead.dealValue) : 0,
            status: lead.status || "New",
            remarks: [], // Start with empty remarks
        };
        
        batch.set(docRef, leadData);
    });
    
    await batch.commit();

    return { message: `${leadsArray.length} lead(s) added successfully from the Excel file.` };
  } catch (error) {
    console.error("Error processing Excel file or writing to Firestore:", error);
    if (error instanceof Error) {
        return { error: `Failed to process file: ${error.message}` };
    }
    return { error: "An unknown error occurred during the upload process." };
  }
}
