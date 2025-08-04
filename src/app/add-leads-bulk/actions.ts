
"use server";

import { db2 } from "@/lib/firebase";
import { collection, writeBatch, doc } from "firebase/firestore";
import * as xlsx from 'xlsx';
import { getSession } from "@/lib/session";

type ActionResult = {
  message?: string;
  error?: string;
};

// Helper function to map Excel columns to Firestore fields
const mapLeadData = (lead: any, sessionAnchorId: string, isAnchorUser: boolean) => {
  const leadCategory = (lead['Lead Category'] || '').toLowerCase();
  
  // If the user is an Anchor, always use their session leadExternalId.
  // Otherwise, use the anchorId from the Excel file, or an empty string if not present.
  const anchorId = isAnchorUser ? sessionAnchorId : (lead.anchorId || '');

  return {
    name: lead['Name'] || '',
    leadCategory: lead['Lead Category'] || 'Dealer',
    contactNumber: (lead['Contact Number'] || '').toString(),
    email: lead['Email'] || '',
    city: lead['City'] || '',
    state: lead['State'] || '',
    zone: lead['Zone'] || '',
    anchorName: lead['Anchor Name'] || '',
    product: lead['Product'] || '',
    leadSource: lead['Lead Source'] || '',
    leadType: lead['Lead Type'] || '',
    priority: lead['Priority'] || '',
    dealValue: lead['Deal Value (Lacs)'] ? Number(lead['Deal Value (Lacs)']) : 0,
    lender: lead['Lender'] || '',
    remarks: lead['Remarks'] ? [{ remark: lead['Remarks'], timestamp: new Date().toISOString() }] : [],
    spoc: lead['SPOC'] || '',
    
    // System-generated fields
    anchorId: anchorId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    leadDate: new Date().toISOString(),
    status: "New",
    initialLeadDate: new Date().toISOString(),
  };
};


export async function addMomentumLeads(formData: FormData): Promise<ActionResult> {
  const file = formData.get('excel-file') as File;
  if (!file) {
    return { error: "No file uploaded." };
  }
  
  const session = await getSession();
  const isAnchorUser = session?.roleType === 'Anchor';
  const sessionAnchorId = isAnchorUser ? session?.leadExternalId || '' : '';

  if (isAnchorUser && !sessionAnchorId) {
      console.warn("Anchor user is uploading bulk leads but does not have a leadExternalId in their session.");
  }

  try {
    const bytes = await file.arrayBuffer();
    const workbook = xlsx.read(bytes, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const leadsArray = xlsx.utils.sheet_to_json(sheet, { raw: false });

    if (!Array.isArray(leadsArray) || leadsArray.length === 0) {
      return { error: "The Excel file is empty or not in the correct format." };
    }

    const dealerBatch = writeBatch(db2);
    const vendorBatch = writeBatch(db2);
    let dealerCount = 0;
    let vendorCount = 0;
    let skippedCount = 0;

    leadsArray.forEach((row: any) => {
        const leadData = mapLeadData(row, sessionAnchorId, isAnchorUser);

        if (leadData.leadCategory.toLowerCase() === 'dealer') {
            const docRef = doc(collection(db2, "dealers"));
            dealerBatch.set(docRef, leadData);
            dealerCount++;
        } else if (leadData.leadCategory.toLowerCase() === 'vendor') {
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
