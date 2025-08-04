
"use server";

import { db2 } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import { z } from "zod";
import { getSession } from "@/lib/session";

const leadFormSchema = z.object({
  name: z.string().min(1, "Name is required."),
  leadCategory: z.enum(["Dealer", "Vendor"], { required_error: "Lead Category is required."}),
  contactNumber: z.string().regex(/^\d{10}$/, "Contact number must be exactly 10 digits."),
  email: z.string().email("Invalid email address."),
  city: z.string().min(1, "City is required."),
  state: z.string().min(1, "State is required."),
  zone: z.string().min(1, "Zone is required."),
  anchorName: z.string().min(1, "Anchor name is required."),
  product: z.string().min(1, "Product is required."),
  leadSource: z.string().min(1, "Lead source is required."),
  leadType: z.string().min(1, "Lead type is required."),
  priority: z.string().min(1, "Priority is required."),
  dealValue: z.string().min(1, "Deal value is required."),
  lender: z.string().min(1, "Lender is required."),
  spoc: z.string().min(1, "SPOC is required."),
  // Optional fields
  assignedTo: z.string().optional(),
  remarks: z.string().optional(),
});


type LeadFormValues = z.infer<typeof leadFormSchema>;

type ActionResult = {
  message?: string;
  error?: string;
};

export async function addSingleLead(data: LeadFormValues): Promise<ActionResult> {
  const validatedFields = leadFormSchema.safeParse(data);

  if (!validatedFields.success) {
    console.error("Form validation failed:", validatedFields.error.flatten().fieldErrors);
    return { error: "Invalid data provided. Please check the form." };
  }
  
  const session = await getSession();
  
  const anchorId = session?.roleType === 'Anchor' ? session.leadExternalId || '' : '';

  if (session?.roleType === 'Anchor' && !anchorId) {
      console.warn("Anchor user is creating a lead but does not have a leadExternalId in their session.");
  }
  
  const { leadCategory, dealValue, remarks, ...rest } = validatedFields.data;
  
  const leadData = {
    ...rest,
    anchorId: anchorId, // Ensure this is correctly assigned
    dealValue: dealValue ? Number(dealValue) : 0,
    remarks: remarks ? [{ remark: remarks, timestamp: new Date().toISOString() }] : [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: "New",
    leadDate: new Date().toISOString(),
    initialLeadDate: new Date().toISOString(),
  };

  try {
    const collectionName = leadCategory.toLowerCase() === 'dealer' ? "dealers" : "vendors";
    const docRef = await addDoc(collection(db2, collectionName), leadData);
    
    return { message: `Lead "${leadData.name}" added successfully to ${collectionName}.` };
  } catch (error) {
    console.error("Error writing to Firestore:", error);
    if (error instanceof Error) {
        return { error: `Failed to add lead: ${error.message}` };
    }
    return { error: "An unknown error occurred while writing to Firestore." };
  }
}
