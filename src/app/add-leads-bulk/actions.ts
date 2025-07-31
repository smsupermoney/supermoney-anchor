
"use server";

import { db1 } from "@/lib/firebase";
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
  const anchorId = session?.leadExternalId;

  if (!anchorId && session?.roleType !== 'Admin') {
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

    const dealerBatch = writeBatch(db1);
    const vendorBatch = writeBatch(db1);
    let dealerCount = 0;
    let vendorCount = 0;
    let skippedCount = 0;

    leadsArray.forEach((lead: any) => {
        const leadCategory = (lead['Lead Category'] || '').toLowerCase();

        const leadData = {
            ...lead,
            // Use lead's anchorId if present, otherwise default to session's anchorId
            anchorId: lead.anchorId || anchorId, 
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            leadDate: lead.leadDate ? new Date(lead.leadDate).toISOString() : new Date().toISOString(),
            initialLeadDate: lead.initialLeadDate ? new Date(lead.initialLeadDate).toISOString() : new Date().toISOString(),
            dealValue: lead['Deal Value (Lacs)'] ? Number(lead['Deal Value (Lacs)']) : 0,
            status: lead.status || "New",
            remarks: [], // Start with empty remarks
        };
        
        if (leadCategory === 'dealer') {
            const docRef = doc(collection(db1, "dealers"));
            dealerBatch.set(docRef, leadData);
            dealerCount++;
        } else if (leadCategory === 'vendor') {
            const docRef = doc(collection(db1, "vendors"));
            vendorBatch.set(docRef, leadData);
            vendorCount++;
        } else {
            skippedCount++;
        }
    });
    
    if (dealerCount > 0) {
        await dealerBatch.commit();
    }
    if (vendorCount > 0) {
        await vendorBatch.commit();
    }
    
    let message = `${dealerCount} Dealer lead(s) and ${vendorCount} Vendor lead(s) added successfully.`;
    if (skippedCount > 0) {
        message += ` ${skippedCount} rows were skipped due to an invalid 'Lead Category'.`;
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

    

    