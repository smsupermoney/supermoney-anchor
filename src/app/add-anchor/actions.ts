"use server";

import { hash } from "bcryptjs";
import { db1 } from "@/lib/firebase";
import { collection, addDoc, query, where, getDocs, writeBatch } from "firebase/firestore";
import { z } from "zod";

type ActionResult = {
  message?: string;
  error?: string;
};

const formSchema = z.object({
  externalId: z.string().min(1, "External ID is required."),
  userName: z.string().min(1, "User name is required."),
  emailAddress: z.string().email("Invalid email address."),
  phoneNumber: z.string().optional(),
  password: z.string().min(6, "Password must be at least 6 characters."),
  roleType: z.enum(["Anchor", "SuperMoney User"]),
  userSubRole: z.string().optional(),
  region: z.string().optional(),
  SmartdashCompanyName: z.string().optional(),
});

type UserFormValues = z.infer<typeof formSchema>;

export async function addUser(data: UserFormValues): Promise<ActionResult> {
  const validatedFields = formSchema.safeParse(data);

  if (!validatedFields.success) {
    return { error: "Invalid data provided. Please check the form." };
  }

  const { password, ...rest } = validatedFields.data;
  const hashed = await hash(password, 12);
  const userData = {
    ...rest,
    password: hashed,
    lastLoginTime: '',
    lastLoginIp: '',
    authToken: '',
    expiryTime: 0,
  };

  try {
    // 1. Add the new user
    const docRef = await addDoc(collection(db1, "users"), userData);
    console.log("Document written with ID: ", docRef.id);

    // 2. Propagate SmartdashCompanyName if provided
    if (userData.SmartdashCompanyName && userData.externalId) {
        const usersRef = collection(db1, "users");
        const q = query(usersRef, where("externalId", "==", userData.externalId));
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
            const batch = writeBatch(db1);
            snapshot.forEach((doc) => {
                batch.update(doc.ref, { SmartdashCompanyName: userData.SmartdashCompanyName });
            });
            await batch.commit();
        }
    }

    return { message: `User "${userData.userName}" added successfully and company name synced.` };
  } catch (error) {
    console.error("Error writing to Firestore:", error);
    if (error instanceof Error) {
        return { error: `Failed to add user to Firestore: ${error.message}` };
    }
    return { error: "An unknown error occurred while writing to Firestore." };
  }
}
