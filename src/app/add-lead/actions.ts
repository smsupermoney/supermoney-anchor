
"use server";

import { z } from "zod";

type ActionResult = {
  message?: string;
  error?: string;
};

const formSchema = z.object({
  dealerName: z.string().min(1, "Dealer name is required."),
  contactPerson: z.string().min(1, "Contact person is required."),
  contactEmail: z.string().email("Invalid email address."),
  contactPhone: z.string().min(10, "Phone number must be at least 10 digits."),
  businessType: z.string().min(1, "Business type is required."),
  location: z.string().min(1, "Location is required."),
  region: z.string().min(1, "Region is required."),
});

type LeadFormValues = z.infer<typeof formSchema>;

export async function addLead(data: LeadFormValues): Promise<ActionResult> {
  const validatedFields = formSchema.safeParse(data);

  if (!validatedFields.success) {
    return { error: "Invalid data provided. Please check the form." };
  }
  
  // In a real application, you would add this data to your database (e.g., Firestore)
  // For this POC, we will just simulate success.
  console.log("New Lead Data:", validatedFields.data);

  return { message: `Lead for "${validatedFields.data.dealerName}" created successfully.` };
}
