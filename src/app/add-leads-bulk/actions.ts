
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
  // If user is anchor, use their leadExternalId. This can be overridden by a value in the Excel sheet.
  const sessionAnchorId = session?.roleType === 'Anchor' ? session?.leadExternalId || '' : '';

  if (session?.roleType === 'Anchor' && !sessionAnchorId) {
      console.warn("Anchor user is uploading bulk leads but does not have a leadExternalId in their session.");
      // We will proceed, but leads might not be associated correctly unless anchorId is in the file.
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

    const dealerBatch = writeBatch(db2);
    const vendorBatch = writeBatch(db2);
    let dealerCount = 0;
    let vendorCount = 0;
    let skippedCount = 0;

    leadsArray.forEach((lead: any) => {
        const leadCategory = (lead['Lead Category'] || '').toLowerCase();

        // Logic: Use anchorId from Excel if present. If not, use the session's anchorId.
        const leadData = {
            ...lead,
            anchorId: lead.anchorId || sessionAnchorId, 
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            // Default leadDate and status
            leadDate: new Date().toISOString(),
            status: "New",
            initialLeadDate: new Date().toISOString(),
            dealValue: lead['Deal Value (Lacs)'] ? Number(lead['Deal Value (Lacs)']) : 0,
            remarks: [], // Start with empty remarks
        };
        
        if (leadCategory === 'dealer') {
            const docRef = doc(collection(db2, "dealers"));
            dealerBatch.set(docRef, leadData);
            dealerCount++;
        } else if (leadCategory === 'vendor') {
            const docRef = doc(collection(db2, "vendors"));
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
