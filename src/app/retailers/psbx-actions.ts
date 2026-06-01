"use server";

import { PsbxLimitData } from "@/types";

export async function fetchPsbxLimit(applicationId: string): Promise<{ data?: PsbxLimitData; error?: string }> {
    const url = "https://live.supermoney.in/psbxService/transaction/limit/get";
    
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ applicationId: Number(applicationId) }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`PSBX API Error (${response.status}): ${errorText}`);
        }

        const json = await response.json();
        
        if (json.code === 200 && json.data) {
            return { data: json.data };
        } else {
            return { error: json.message || "Failed to fetch PSBX details." };
        }

    } catch (error) {
        console.error("PSBX Fetch Error:", error);
        return { error: error instanceof Error ? error.message : "Internal server error connecting to PSBX." };
    }
}
