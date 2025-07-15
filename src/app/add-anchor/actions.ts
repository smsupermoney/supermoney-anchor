
"use server";

import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import { z } from "zod";

type ActionResult = {
  message?: string;
  error?: string;
};

const formSchema = z.object({
  externalId: z.string().min(1, "Anchor ID is required."),
  userName: z.string().min(1, "User name is required."),
  emailAddress: z.string().email("Invalid email address."),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

type AnchorFormValues = z.infer<typeof formSchema>;

export async function addAnchor(data: AnchorFormValues): Promise<ActionResult> {
  const validatedFields = formSchema.safeParse(data);

  if (!validatedFields.success) {
    return { error: "Invalid data provided. Please check the form." };
  }

  const anchorData = {
    ...validatedFields.data,
    roleType: 'Anchor',
    lastLoginTime: '', // Will be set on first login
    lastLoginIp: '',   // Will be set on first login
  };

  try {
    const docRef = await addDoc(collection(db, "users"), anchorData);
    console.log("Document written with ID: ", docRef.id);
    return { message: `Anchor "${anchorData.userName}" added successfully.` };
  } catch (error) {
    console.error("Error writing to Firestore:", error);
    if (error instanceof Error) {
        return { error: `Failed to add anchor to Firestore: ${error.message}` };
    }
    return { error: "An unknown error occurred while writing to Firestore." };
  }
}
