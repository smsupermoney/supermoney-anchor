
"use server";

import { db } from "@/lib/firebase";
import { collection, writeBatch, doc } from "firebase/firestore";

type ActionResult = {
  message?: string;
  error?: string;
};

// A more forgiving JSON parser
function parseRelaxedJson(jsonString: string) {
    try {
        // Remove comments
        let cleanedString = jsonString.replace(/\/\/.*$/gm, '');
        // Remove trailing commas from objects and arrays
        cleanedString = cleanedString.replace(/,(\s*[}\]])/g, '$1');
        // Add quotes to unquoted keys
        cleanedString = cleanedString.replace(/([{,]\s*)(\w+)\s*:/g, '$1"$2":');
        // Replace single quotes with double quotes
        cleanedString = cleanedString.replace(/'/g, '"');
        return JSON.parse(cleanedString);
    } catch (e) {
        // If the above fails, it might be an issue with the regex. 
        // We re-throw the error with a more specific message.
        console.error("Advanced JSON Parsing Error:", e);
        throw new Error("Invalid JSON format. Please check for syntax errors like missing commas or mismatched brackets.");
    }
}


export async function addInvoices(jsonString: string): Promise<ActionResult> {
  let invoicesArray: any[];

  try {
    invoicesArray = parseRelaxedJson(jsonString);
  } catch (error) {
    console.error("JSON Parsing Error:", error);
    if (error instanceof Error) {
        return { error: error.message };
    }
    return { error: "An unknown error occurred during JSON parsing." };
  }

  if (!Array.isArray(invoicesArray)) {
    return { error: "Input must be a JSON array of invoice objects." };
  }
  
  if (invoicesArray.length === 0) {
    return { error: "The JSON array cannot be empty." };
  }

  try {
    const batch = writeBatch(db);

    invoicesArray.forEach(invoice => {
        // Use the provided 'id' for the document ID, or let Firestore auto-generate one
        const docRef = invoice.id ? doc(db, "invoices", invoice.id) : doc(collection(db, "invoices"));
        
        // If an ID was present in the object, we don't want to write it as a field
        const invoiceData = {...invoice};
        if (invoiceData.id) {
            delete invoiceData.id;
        }
        
        batch.set(docRef, invoiceData);
    });
    
    await batch.commit();

    return { message: `${invoicesArray.length} invoice(s) added successfully.` };
  } catch (error) {
    console.error("Error writing to Firestore:", error);
    if (error instanceof Error) {
        return { error: `Failed to add invoices to Firestore: ${error.message}` };
    }
    return { error: "An unknown error occurred while writing to Firestore." };
  }
}
