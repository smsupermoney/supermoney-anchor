"use server";

import { db1 } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { revalidatePath } from "next/cache";

export async function togglePsbxStatus(programId: string, enabled: boolean) {
  try {
    const programRef = doc(db1, "programs", programId);
    await updateDoc(programRef, {
      psbxEnabled: enabled
    });
    revalidatePath("/psbx");
    return { success: true };
  } catch (error) {
    console.error("Error toggling PSBX status:", error);
    return { error: "Failed to update status." };
  }
}
