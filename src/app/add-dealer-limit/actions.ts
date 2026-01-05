
"use server";

import { db1 } from "@/lib/firebase";
import { collection, writeBatch, doc } from "firebase/firestore";
import type { UpcomingPayment } from "@/types";

type ActionResult = {
  message?: string;
  error?: string;
};

export async function addDealerProgramLimits(jsonString: string): Promise<ActionResult> {
  let upcomingPayments: UpcomingPayment[];

  try {
    upcomingPayments = JSON.parse(jsonString);
  } catch (e) {
    return { error: "Invalid JSON format. Please check your data." };
  }

  if (!Array.isArray(upcomingPayments) || upcomingPayments.length === 0) {
    return { error: "The JSON must be an array of payment objects and cannot be empty." };
  }

  try {
    const batch = writeBatch(db1);
    const collectionRef = collection(db1, "upcomingPayments");

    upcomingPayments.forEach((payment) => {
      // If payment has an ID, use it. Otherwise, Firestore will generate one.
      const docRef = payment.id ? doc(collectionRef, payment.id) : doc(collectionRef);
      batch.set(docRef, payment);
    });
    
    await batch.commit();

    return { message: `${upcomingPayments.length} upcoming payment(s) added or updated successfully.` };
  } catch (error) {
    console.error("Error writing to Firestore:", error);
    if (error instanceof Error) {
        return { error: `Failed to process payments: ${error.message}` };
    }
    return { error: "An unknown error occurred during the database operation." };
  }
}

    