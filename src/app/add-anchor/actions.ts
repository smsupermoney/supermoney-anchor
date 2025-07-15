
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


export async function addAnchors(jsonString: string): Promise<ActionResult> {
  let anchorsArray: any[];

  try {
    anchorsArray = parseRelaxedJson(jsonString);
  } catch (error) {
    console.error("JSON Parsing Error:", error);
    if (error instanceof Error) {
        return { error: error.message };
    }
    return { error: "An unknown error occurred during JSON parsing." };
  }

  if (!Array.isArray(anchorsArray)) {
    return { error: "Input must be a JSON array of anchor user objects." };
  }
  
  if (anchorsArray.length === 0) {
    return { error: "The JSON array cannot be empty." };
  }

  try {
    const batch = writeBatch(db);

    anchorsArray.forEach(anchor => {
        // Use the provided 'id' for the document ID, or let Firestore auto-generate one
        const docRef = anchor.id ? doc(db, "users", anchor.id) : doc(collection(db, "users"));
        
        // If an ID was present in the object, we don't want to write it as a field
        const anchorData = {...anchor, roleType: 'Anchor'}; // Ensure roleType is set to Anchor
        if (anchorData.id) {
            delete anchorData.id;
        }
        
        batch.set(docRef, anchorData);
    });
    
    await batch.commit();

    return { message: `${anchorsArray.length} anchor(s) added successfully.` };
  } catch (error) {
    console.error("Error writing to Firestore:", error);
    if (error instanceof Error) {
        return { error: `Failed to add anchors to Firestore: ${error.message}` };
    }
    return { error: "An unknown error occurred while writing to Firestore." };
  }
}
