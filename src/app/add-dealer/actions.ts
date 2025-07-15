
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


export async function addDealers(jsonString: string): Promise<ActionResult> {
  let dealersArray: any[];

  try {
    dealersArray = parseRelaxedJson(jsonString);
  } catch (error) {
    console.error("JSON Parsing Error:", error);
    if (error instanceof Error) {
        return { error: error.message };
    }
    return { error: "An unknown error occurred during JSON parsing." };
  }

  if (!Array.isArray(dealersArray)) {
    return { error: "Input must be a JSON array of dealer objects." };
  }
  
  if (dealersArray.length === 0) {
    return { error: "The JSON array cannot be empty." };
  }

  try {
    const batch = writeBatch(db);

    dealersArray.forEach(dealer => {
        // Use the provided 'id' for the document ID, or let Firestore auto-generate one
        const docRef = dealer.id ? doc(db, "dealers", dealer.id) : doc(collection(db, "dealers"));
        
        // If an ID was present in the object, we don't want to write it as a field
        const dealerData = {...dealer};
        if (dealerData.id) {
            delete dealerData.id;
        }
        
        batch.set(docRef, dealerData);
    });
    
    await batch.commit();

    return { message: `${dealersArray.length} dealer(s) added successfully.` };
  } catch (error) {
    console.error("Error writing to Firestore:", error);
    if (error instanceof Error) {
        return { error: `Failed to add dealers to Firestore: ${error.message}` };
    }
    return { error: "An unknown error occurred while writing to Firestore." };
  }
}
