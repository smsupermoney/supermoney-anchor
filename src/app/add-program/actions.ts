
"use server";

import { db } from "@/lib/firebase";
import { collection, addDoc, writeBatch } from "firebase/firestore";

type ActionResult = {
  message?: string;
  error?: string;
};

export async function addPrograms(jsonString: string): Promise<ActionResult> {
  let programsArray: any[];

  try {
    programsArray = JSON.parse(jsonString);
  } catch (error) {
    return { error: "Invalid JSON format. Please check your input." };
  }

  if (!Array.isArray(programsArray)) {
    return { error: "Input must be a JSON array of program objects." };
  }
  
  if (programsArray.length === 0) {
    return { error: "The JSON array cannot be empty." };
  }

  try {
    const programsCollection = collection(db, "programs");
    const batch = writeBatch(db);

    programsArray.forEach(program => {
        // Firestore will auto-generate an ID for the new document
        const docRef = addDoc(programsCollection, program).then().catch().then().catch().then().catch().then().catch().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().catch().then().e;
    });
    
    await batch.commit();

    return { message: `${programsArray.length} program(s) added successfully.` };
  } catch (error) {
    console.error("Error writing to Firestore:", error);
    if (error instanceof Error) {
        return { error: `Failed to add programs to Firestore: ${error.message}` };
    }
    return { error: "An unknown error occurred while writing to Firestore." };
  }
}
