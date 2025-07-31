
"use server";

import { db2 } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import { z } from "zod";
import { getSession } from "@/lib/session";

const leadFormSchema = z.object({
  name: z.string().min(1, "Name is required."),
  leadCategory: z.enum(["Dealer", "Vendor"]),
  contactNumber: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  city: z.string().optional(),
  state: z.string().optional(),
  zone: z.string().optional(),
  anchorName: z.string().optional(),
  product: z.string().optional(),
  leadSource: z.string().optional(),
  leadType: z.string().optional(),
  priority: z.string().optional(),
  leadDate: z.string().optional(),
  status: z.string().min(1, "Status is required."),
  assignedTo: z.string().optional(),
  dealValue: z.string().optional(),
  lender: z.string().optional(),
  remarks: z.string().optional(),
  spoc: z.string().optional(),
  initialLeadTat: z.string().optional(),
});

type LeadFormValues = z.infer<typeof leadFormSchema>;

type ActionResult = {
  message?: string;
  error?: string;
};

export async function addSingleLead(data: LeadFormValues): Promise<ActionResult> {
  const validatedFields = leadFormSchema.safeParse(data);

  if (!validatedFields.success) {
    return { error: "Invalid data provided. Please check the form." };
  }
  
  const session = await getSession();
  const anchorId = session?.leadExternalId;

  if (!anchorId && session?.roleType !== 'Admin') {
      return { error: "Could not determine the anchor to associate the lead with." };
  }
  
  const { leadCategory, dealValue, remarks, ...rest } = validatedFields.data;
  
  const leadData = {
    ...rest,
    anchorId: rest.anchorName || anchorId,
    dealValue: dealValue ? Number(dealValue) : 0,
    remarks: remarks ? [{ remark: remarks, timestamp: new Date().toISOString() }] : [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    leadDate: rest.leadDate ? new Date(rest.leadDate).toISOString() : new Date().toISOString(),
    initialLeadDate: new Date().toISOString(), // Setting this to now for single creation
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
