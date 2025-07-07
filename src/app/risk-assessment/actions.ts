"use server";

import { assessRetailerRisk } from "@/ai/flows/risk-assessment";
import { invoices } from "@/lib/data";
import { z } from "zod";

const formSchema = z.object({
  retailerId: z.string().min(1, "Please select a retailer."),
});

type State = {
  message?: string;
  data?: {
    riskScore: number;
    riskFactors: string;
    recommendations: string;
  };
  error?: boolean;
};

export async function generateRiskAssessment(
  prevState: State,
  formData: FormData
): Promise<State> {
  const validatedFields = formSchema.safeParse({
    retailerId: formData.get("retailerId"),
  });

  if (!validatedFields.success) {
    return {
      message: "Invalid form data.",
      error: true,
    };
  }

  const { retailerId } = validatedFields.data;
  const retailer = (await import("@/lib/data")).retailers.find(r => r.id === retailerId);

  if (!retailer) {
    return {
      message: "Retailer not found.",
      error: true,
    };
  }
  
  // Create a summary of invoice data for the AI
  const retailerInvoices = invoices.filter(i => i.retailerName === retailer.name);
  const invoiceDataSummary = `Total invoices: ${retailerInvoices.length}. 
    Statuses: ${JSON.stringify(retailerInvoices.reduce((acc, inv) => {
        acc[inv.status] = (acc[inv.status] || 0) + 1;
        return acc;
    }, {} as Record<string, number>))}. 
    Total amount: ${retailerInvoices.reduce((sum, inv) => sum + inv.amount, 0)}.`;


  try {
    const result = await assessRetailerRisk({
      retailerName: retailer.name,
      invoiceData: invoiceDataSummary,
    });
    return { data: result, message: "Assessment complete." };
  } catch (e) {
    console.error(e);
    return {
      message: "An error occurred during risk assessment.",
      error: true,
    };
  }
}
