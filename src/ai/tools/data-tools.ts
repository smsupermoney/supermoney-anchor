
'use server';

import { ai } from '@/ai/genkit';
import { getDealers, getInvoices, getPrograms } from '@/lib/data';
import { z } from 'zod';

const ToolInputSchema = z.object({
    anchorId: z.string().optional().describe("The anchor ID to filter the data for. If not provided, data for all anchors will be fetched."),
});

// Tool to get a summary of all programs
export const getProgramSummaryTool = ai.defineTool(
    {
        name: 'getProgramSummary',
        description: 'Get a summary of financing programs, including total credit limits and utilization.',
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

// Tool to get a summary of invoices
export const getInvoiceSummaryTool = ai.defineTool(
    {
        name: 'getInvoiceSummary',
        description: 'Get a summary of invoices, including total count, overdue count, and amounts.',
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


// Tool to get a summary of dealers
export const getDealerSummaryTool = ai.defineTool(
    {
        name: 'getDealerSummary',
        description: 'Get a summary of dealers, including total count and status breakdown.',
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
