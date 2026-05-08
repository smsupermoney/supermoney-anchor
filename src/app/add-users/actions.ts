
"use server";

import { hash } from "bcryptjs";
import { requireAdmin } from "@/lib/auth";
import { db1 } from "@/lib/firebase";
import { collection, writeBatch, doc } from "firebase/firestore";
import type { User } from "@/types";

type ActionResult = {
  message?: string;
  error?: string;
};

export async function addUsersFromJson(jsonString: string): Promise<ActionResult> {
  let usersArray: User[];

  try {
    usersArray = JSON.parse(jsonString);
  } catch (e) {
    return { error: "Invalid JSON format. Please check your data." };
  }

  if (!Array.isArray(usersArray) || usersArray.length === 0) {
    return { error: "The JSON must be an array of user objects and cannot be empty." };
  }

  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const batch = writeBatch(db1);

    for (const user of usersArray) {
      if (!user.id) {
        throw new Error("Each user object in the JSON must have an 'id' field.");
      }
      const docRef = doc(db1, "users", user.id);

      const userData = { ...user };

      const rawPassword = userData.password || 'password';
      userData.password = await hash(rawPassword, 12);
      userData.lastLoginIp = user.lastLoginIp || '';
      userData.lastLoginTime = user.lastLoginTime || '';
      userData.authToken = user.authToken || '';
      userData.expiryTime = user.expiryTime || 0;

      batch.set(docRef, userData);
    }
    
    await batch.commit();

    return { message: `${usersArray.length} user(s) added or updated successfully.` };
  } catch (error) {
    console.error("Error writing users to Firestore:", error);
    if (error instanceof Error) {
        return { error: `Failed to process users: ${error.message}` };
    }
    return { error: "An unknown error occurred during the database operation." };
  }
}
