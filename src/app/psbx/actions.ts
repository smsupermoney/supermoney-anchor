"use server";

import { requireAdmin } from "@/lib/auth";
import { db1 } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { revalidatePath } from "next/cache";

type ToggleResult = { success?: boolean; error?: string };

export async function togglePsbxStatus(programId: string, enabled: boolean): Promise<ToggleResult> {
  const authError = await requireAdmin();
  if (authError) return authError;

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
