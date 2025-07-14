
"use server";

import { assessDealerRisk } from "@/ai/flows/risk-assessment";
import { getInvoices, getDealers } from "@/lib/data";
import { z } from "zod";

const formSchema = z.object({
  dealerId: z.string().min(1, "Please select a dealer."),
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

export async function generateDealerRiskAssessment(
  prevState: State,
  formData: FormData
): Promise<State> {
  const validatedFields = formSchema.safeParse({
    dealerId: formData.get("dealerId"),
  });

  if (!validatedFields.success) {
    return {
      message: "Invalid form data.",
      error: true,
    };
  }

  const { dealerId } = validatedFields.data;
  
  const dealers = await getDealers();
  const dealer = dealers.find(d => d.id === dealerId);

  if (!dealer) {
    return {
      message: "Dealer not found.",
      error: true,
    };
  }
  
  // Create a summary of invoice data for the AI
  const invoices = await getInvoices();
  const dealerInvoices = invoices.filter(i => i.dealerName === dealer.name);
  const invoiceDataSummary = `Total invoices: ${dealerInvoices.length}. 
    Statuses: ${JSON.stringify(dealerInvoices.reduce((acc, inv) => {
        acc[inv.status] = (acc[inv.status] || 0) + 1;
        return acc;
    }, {} as Record<string, number>))}. 
    Total amount: ${dealerInvoices.reduce((sum, inv) => sum + inv.amount, 0)}.`;


  try {
    const result = await assessDealerRisk({
      dealerName: dealer.name,
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
