
'use server';

import { ai } from '@/ai/genkit';
import { getDealers, getInvoices, getPrograms, getMomentumDealerLeads } from '@/lib/data';
import { z } from 'zod';

const ToolInputSchema = z.object({
    anchorId: z.string().optional().describe("The anchor ID to filter the data for. If not provided, data for all anchors will be fetched."),
});

// --- SUMMARY TOOLS (for quick, high-level questions) ---

export const getProgramSummaryTool = ai.defineTool(
    {
        name: 'getProgramSummary',
        description: 'Get a quick summary of financing programs, including total credit limits and utilization. Use for high-level questions like "what is my total limit?"',
        inputSchema: ToolInputSchema,
        outputSchema: z.object({
            totalPrograms: z.number(),
            totalLimit: z.number(),
            totalUtilized: z.number(),
            totalAvailable: z.number(),
        })
    },
    async ({ anchorId }) => {
        const { programs } = await getPrograms(anchorId);
        const totalLimit = programs.reduce((sum, p) => sum + (p.totalLimit || 0), 0);
        const totalUtilized = programs.reduce((sum, p) => sum + (p.usedLimit || 0), 0);
        
        return {
            totalPrograms: programs.length,
            totalLimit,
            totalUtilized,
            totalAvailable: totalLimit - totalUtilized,
        };
    }
);

export const getInvoiceSummaryTool = ai.defineTool(
    {
        name: 'getInvoiceSummary',
        description: 'Get a quick summary of invoices, including total count, overdue count, and amounts. Use for high-level questions like "how many invoices are overdue?"',
        inputSchema: ToolInputSchema,
        outputSchema: z.object({
            totalInvoices: z.number(),
            overdueInvoices: z.number(),
            pendingInvoices: z.number(),
            disbursedInvoices: z.number(),
            totalOverdueAmount: z.number(),
            totalInvoiceAmount: z.number(),
        })
    },
    async ({ anchorId }) => {
        const invoices = await getInvoices(anchorId);
        const totalOverdueAmount = invoices
            .filter(inv => (inv.overdueAmount ?? 0) > 0)
            .reduce((sum, inv) => sum + (inv.overdueAmount ?? 0), 0);
            
        return {
            totalInvoices: invoices.length,
            overdueInvoices: invoices.filter(inv => (inv.overdueAmount ?? 0) > 0).length,
            pendingInvoices: invoices.filter(inv => ['Initiated', 'Approved', 'Sent to Lender'].includes(inv.status)).length,
            disbursedInvoices: invoices.filter(inv => inv.status === 'Disbursed').length,
            totalOverdueAmount,
            totalInvoiceAmount: invoices.reduce((sum, inv) => sum + inv.amount, 0),
        };
    }
);

export const getDealerSummaryTool = ai.defineTool(
    {
        name: 'getDealerSummary',
        description: 'Get a quick summary of dealers, including total count and status breakdown. Use for high-level questions like "how many dealers are active?"',
        inputSchema: ToolInputSchema,
        outputSchema: z.object({
            totalDealers: z.number(),
            activeDealers: z.number(),
            inactiveDealers: z.number(),
            pendingDealers: z.number(),
        })
    },
    async ({ anchorId }) => {
        const dealers = await getDealers(anchorId);
        return {
            totalDealers: dealers.length,
            activeDealers: dealers.filter(d => d.status === 'Active').length,
            inactiveDealers: dealers.filter(d => d.status === 'Inactive').length,
            pendingDealers: dealers.filter(d => d.status === 'Pending').length,
        };
    }
);

// --- FULL DATA TOOLS (for detailed, specific questions) ---

export const getFullProgramDataTool = ai.defineTool(
    {
        name: 'getFullProgramData',
        description: 'Get the full list of all financing programs. Use this for detailed questions about specific programs that the summary tool cannot answer.',
        inputSchema: ToolInputSchema,
        outputSchema: z.any() 
    },
    async ({ anchorId }) => {
        const { programs } = await getPrograms(anchorId);
        return programs;
    }
);

export const getFullInvoiceDataTool = ai.defineTool(
    {
        name: 'getFullInvoiceData',
        description: 'Get the full list of all invoices. Use this for detailed questions about specific invoices, amounts, dealers, or statuses that the summary tool cannot answer.',
        inputSchema: ToolInputSchema,
        outputSchema: z.any()
    },
    async ({ anchorId }) => {
        return await getInvoices(anchorId);
    }
);

export const getFullDealerDataTool = ai.defineTool(
    {
        name: 'getFullDealerData',
        description: 'Get the full list of all dealers and their financial details. Use this for detailed questions about specific dealers, limits, or regions that the summary tool cannot answer.',
        inputSchema: ToolInputSchema,
        outputSchema: z.any()
    },
    async ({ anchorId }) => {
        return await getDealers(anchorId);
    }
);

export const getFullLeadDataTool = ai.defineTool(
    {
        name: 'getFullLeadData',
        description: 'Get the full list of all leads. Use this to answer any questions related to leads, such as counts, statuses, or details about specific leads.',
        inputSchema: z.object({
            leadAnchorId: z.string().optional().describe("The anchor ID to filter leads for. This is different from the main anchorId."),
        }),
        outputSchema: z.any()
    },
    async ({ leadAnchorId }) => {
        return await getMomentumDealerLeads(leadAnchorId);
    }
);
