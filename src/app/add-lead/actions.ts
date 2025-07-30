
"use server";

import { db2 } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import { z } from "zod";
import { getSession } from "@/lib/session";

type ActionResult = {
  message?: string;
  error?: string;
};

const formSchema = z.object({
  name: z.string().min(1, "Name is required."),
  spoc: z.string().min(1, "SPOC is required."),
  contactNumber: z.string().min(10, "Contact number must be at least 10 digits."),
  email: z.string().email("Invalid email address.").optional().or(z.literal('')),
  city: z.string().min(1, "City is required."),
  zone: z.string().min(1, "Zone is required."),
  state: z.string().min(1, "State is required."),
  anchorId: z.string(),
  product: z.string().min(1, "Product is required."),
  leadSource: z.string().min(1, "Lead Source is required."),
  leadType: z.string().min(1, "Lead Type is required."),
  priority: z.string().optional(),
  dealValue: z.preprocess(
    (a) => parseFloat(z.string().parse(a)),
    z.number().positive("Deal value must be positive.")
  ),
  status: z.string().min(1, "Status is required."),
});

type LeadFormValues = z.infer<typeof formSchema>;

export async function addLead(data: LeadFormValues): Promise<ActionResult> {
  const validatedFields = formSchema.safeParse(data);
  const session = await getSession();

  if (!validatedFields.success) {
    return { error: "Invalid data provided. Please check the form." };
  }
  
  if (!session?.externalId) {
      return { error: "Could not determine the anchor. Please log in again." };
  }

  const leadData = {
    ...validatedFields.data,
    anchorId: session.externalId, // Ensure it's the logged-in user's anchor ID
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    leadDate: new Date().toISOString(),
    initialLeadDate: new Date().toISOString(),
    remarks: [],
    assignedTo: session.emailAddress,
  };

  try {
    const docRef = await addDoc(collection(db2, "dealers"), leadData);
    console.log("Lead document written with ID: ", docRef.id);
    return { message: `Lead "${leadData.name}" added successfully.` };
  } catch (error) {
    console.error("Error writing to Firestore:", error);
    if (error instanceof Error) {
        return { error: `Failed to add lead to Firestore: ${error.message}` };
    }
    return { error: "An unknown error occurred while writing to Firestore." };
  }
}
