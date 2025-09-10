
"use server";

import { db2 } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import { z } from "zod";
import { getSession } from "@/lib/session";

const leadFormSchema = z.object({
  name: z.string().min(1, "Name is required."),
  leadCategory: z.enum(["Dealer", "Vendor"], { required_error: "Lead Category is required."}),
  contactNumber: z.string().regex(/^\d{10}$/, "Contact number must be exactly 10 digits."),
  spoc: z.string().min(1, "SPOC is required."),
  // Optional fields
  email: z.string().email("Invalid email address.").optional().or(z.literal("")),
  city: z.string().optional(),
  state: z.string().optional(),
  zone: z.string().optional(),
  product: z.string().optional(),
  leadSource: z.string().optional(),
  leadType: z.string().optional(),
  priority: z.string().optional(),
  dealValue: z.string().optional(),
  lender: z.string().optional(),
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
  
  // Example of what the `session` object looks like for an anchor user:
  // {
  //   "id": "8eqZodWO89So7VApzCef", // The unique Firestore document ID for this user
  //   "externalId": "ANC001",      // The business-facing ID for the anchor company
  //   "userName": "Jindal stainless steelway limited",
  //   "emailAddress": "jindal@example.com",
  //   "roleType": "Anchor",
  //   // ...and other session properties
  // }
  
  const anchorId = session?.roleType === 'Anchor' ? session.leadExternalId || '' : '';
  const anchorName = session?.roleType === 'Anchor' ? session.userName || 'Supermoney Admin' : 'Supermoney Admin';

  if (session?.roleType === 'Anchor' && !anchorId) {
      console.warn("Anchor user is creating a lead but does not have a user ID in their session.");
  }
  
  const { leadCategory, dealValue, remarks, ...rest } = validatedFields.data;

  const leadData = {
    ...rest,
    anchorId: anchorId,
    anchorName: anchorName,
    dealValue: dealValue ? Number(dealValue) : 0,
    remarks: remarks ? [{ remark: remarks, timestamp: new Date().toISOString(), user: session?.userName || 'System' }] : [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: "New",
    leadDate: new Date().toISOString(),
    initialLeadDate: new Date().toISOString(),
    assignedTo: null,
  };

  console.log({leadData, session, anchorId, anchorName});

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
