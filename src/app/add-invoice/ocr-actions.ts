"use server";

import { getSession } from "@/lib/session";

/**
 * Server action to call the external Supermoney OCR API for invoice reading.
 */
export async function readInvoiceWithExternalApi(filename: string, base64Data: string) {
    const session = await getSession();
    // Use user's email as external_id, fallback for admin cases
    const email = session?.emailAddress || "anchor@supermoney.in";
    
    const url = "https://uat.supermoney.in/gcppython/gcp/call/supermoney/agent/invoice-reader/";
    
    // Remove data URI prefix (e.g., "data:image/png;base64,") if present
    const cleanBase64 = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;

    const body = {
        "agent_id": 1,
        "external_id": email,
        "inputs": [
            {
                "name": filename,
                "data": cleanBase64
            }
        ]
    };

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`OCR API Error (${response.status}): ${errorText}`);
        }

        const json = await response.json();
        
        // Extract data based on the provided response structure: outputs[0].output.data[0]
        const apiData = json.outputs?.[0]?.output?.data?.[0];

        if (!apiData) {
            throw new Error("Invalid response format from OCR API or no data found");
        }

        /**
         * Normalizes date from DD-MM-YYYY (from API) to YYYY-MM-DD (for our app)
         */
        const normalizeDate = (dateStr: string | null | undefined) => {
            if (!dateStr) return "";
            const parts = dateStr.split('-');
            if (parts.length === 3 && parts[0].length === 2 && parts[2].length === 4) {
                // Assuming DD-MM-YYYY format
                return `${parts[2]}-${parts[1]}-${parts[0]}`;
            }
            return dateStr;
        };

        return {
            invoiceNumber: apiData.invoice_number || "N/A",
            dealerName: apiData.bill_send_to || "N/A",
            documentType: "Invoice",
            amount: Number(apiData.invoice_amount) || 0,
            // Fallback to invoice_date if due date is missing
            dueDate: normalizeDate(apiData.invoice_due_date || apiData.invoice_date),
            gstOrGstin: apiData.bill_send_to_gst || "N/A",
        };

    } catch (error) {
        console.error("External OCR API failure:", error);
        throw error;
    }
}
