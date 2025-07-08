"use client";

import PageHeader from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { invoices, lenders } from "@/lib/data";
import { IndianRupee, FileText, AlertTriangle, BadgePercent, CalendarClock, TrendingUp, TrendingDown, Library } from "lucide-react";
import StatusBadge from "@/components/status-badge";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMemo } from "react";

const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
const formatCompactCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', notation: 'compact', maximumFractionDigits: 1 }).format(amount);

export default function Dashboard() {

  const {
    totalSanctionedLimit,
    totalUtilizedLimit,
    totalAvailableLimit,
    weightedAverageCostOfCapital,
    totalOverdueAmount,
  } = useMemo(() => {
    let totalSanctionedLimit = 0;
    let totalUtilizedLimit = 0;
    let weightedCostSum = 0;
    let totalOverdueAmount = 0;

    lenders.forEach(lender => {
      totalSanctionedLimit += lender.totalLimit;
      
      const programs = invoices.filter(i => {
        const program = lender.programs.find(p => p.id === i.programId);
        return !!program;
      });

      const utilizedForLender = programs.reduce((sum, inv) => sum + inv.amount, 0);
      totalUtilizedLimit += utilizedForLender;

      lender.programs.forEach(p => {
        const programInvoices = invoices.filter(i => i.programId === p.id);
        const utilizedForProgram = programInvoices.reduce((sum, inv) => sum + inv.amount, 0);
        weightedCostSum += utilizedForProgram * p.interestRate;
      });
      
      const overdueInvoices = invoices.filter(i => {
        const program = lender.programs.find(p => p.id === i.programId);
        return !!program && i.status === 'Overdue';
      });
      totalOverdueAmount += overdueInvoices.reduce((sum, inv) => sum + inv.amount, 0);
    });

    const totalAvailableLimit = totalSanctionedLimit - totalUtilizedLimit;
    const weightedAverageCostOfCapital = totalUtilizedLimit > 0 ? weightedCostSum / totalUtilizedLimit : 0;
    
    return {
      totalSanctionedLimit,
      totalUtilizedLimit,
      totalAvailableLimit,
      weightedAverageCostOfCapital,
      totalOverdueAmount,
    };
  }, []);

  const payablesInvoices = invoices.filter(i => i.programType === 'Payables');
  const receivablesInvoices = invoices.filter(i => i.programType === 'Receivables');

  return (
    <div className="flex flex-col h-full gap-4 p-2">
      <PageHeader title="Unified SCF Command Center" />

      {/* KPI Summary Bar */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Sanctioned</CardDescription>
            <CardTitle className="text-2xl">{formatCompactCurrency(totalSanctionedLimit)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Utilized</CardDescription>
            <CardTitle className="text-2xl">{formatCompactCurrency(totalUtilizedLimit)}</CardTitle>
          </CardHeader>
        </Card>
         <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Available</CardDescription>
            <CardTitle className="text-2xl text-primary">{formatCompactCurrency(totalAvailableLimit)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Avg. Cost of Capital</CardDescription>
            <CardTitle className="text-2xl">{weightedAverageCostOfCapital.toFixed(2)}%</CardTitle>
          </CardHeader>
        </Card>
         <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Overdue</CardDescription>
            <CardTitle className="text-2xl text-destructive">{formatCompactCurrency(totalOverdueAmount)}</CardTitle>
          </CardHeader>
        </Card>
         <Card>
          <CardHeader className="pb-2">
            <CardDescription>DPO Trend</CardDescription>
            <CardTitle className="text-2xl flex items-center">45 <TrendingUp className="ml-2 h-5 w-5 text-green-500"/></CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Lender-wise Limit Management Module */}
      <Card>
        <CardHeader>
            <CardTitle>Lender-wise Limit Management</CardTitle>
        </CardHeader>
        <CardContent>
            <Accordion type="single" collapsible className="w-full">
                {lenders.map(lender => {
                    const lenderUtilized = invoices.filter(i => lender.programs.some(p => p.id === i.programId)).reduce((sum, i) => sum + i.amount, 0);
                    const lenderAvailable = lender.totalLimit - lenderUtilized;
                    const lenderUtilizationPercentage = (lenderUtilized / lender.totalLimit) * 100;
                    const isNearingLimit = lenderUtilizationPercentage > 80;

                    return (
                        <AccordionItem value={lender.id} key={lender.id}>
                            <AccordionTrigger className="hover:no-underline">
                                <div className="w-full grid grid-cols-5 items-center text-sm gap-4">
                                    <div className="font-bold col-span-2 flex items-center gap-2">
                                        <Library className="h-4 w-4 text-muted-foreground" />
                                        {lender.name}
                                        {isNearingLimit && <Badge variant="destructive" className="text-xs">Limit Reached</Badge>}
                                    </div>
                                    <div className="text-right">{formatCurrency(lender.totalLimit)}</div>
                                    <div className="text-right">{formatCurrency(lenderUtilized)}</div>
                                    <div className="text-right">{formatCurrency(lenderAvailable)}</div>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                <div className="px-4 py-2 bg-secondary/50 rounded-md">
                                    <div className="grid grid-cols-6 gap-4 font-semibold text-xs text-muted-foreground mb-2">
                                        <div className="col-span-2">Program Name</div>
                                        <div>Limit</div>
                                        <div>Utilized</div>
                                        <div>Available</div>
                                        <div className="text-center">APR%</div>
                                    </div>
                                    {lender.programs.map(program => {
                                        const programInvoices = invoices.filter(i => i.programId === program.id);
                                        const programUtilized = programInvoices.reduce((sum, i) => sum + i.amount, 0);
                                        const programLimit = lender.limitType === 'Fungible' ? lender.totalLimit : program.limit || 0;
                                        const programAvailable = programLimit - programUtilized;

                                        return (
                                            <div key={program.id} className="grid grid-cols-6 gap-4 items-center text-xs py-1">
                                                <div className="col-span-2 font-medium">{program.name}</div>
                                                <div>{lender.limitType === 'Fungible' ? <Badge variant="secondary">Interchangeable</Badge> : formatCurrency(program.limit || 0)}</div>
                                                <div>{formatCurrency(programUtilized)}</div>
                                                <div>{formatCurrency(programAvailable)}</div>
                                                <div className="text-center">{program.interestRate.toFixed(2)}%</div>
                                                <Button size="sm" variant="ghost" asChild><Link href="/invoices">View Txns</Link></Button>
                                            </div>
                                        )
                                    })}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    )
                })}
            </Accordion>
        </CardContent>
      </Card>
      
      {/* Program-Specific Performance & Action Center */}
      <div className="grid md:grid-cols-2 gap-6">
        <Tabs defaultValue="payables" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="payables">Payables Financing (Vendors)</TabsTrigger>
                <TabsTrigger value="receivables">Receivables Financing (Dealers)</TabsTrigger>
            </TabsList>
            <TabsContent value="payables">
                <Card>
                    <CardHeader><CardTitle className="text-base">Recent Vendor Invoices</CardTitle></CardHeader>
                    <CardContent>
                      <InvoiceTable invoices={payablesInvoices.slice(0,5)} />
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="receivables">
                <Card>
                    <CardHeader><CardTitle className="text-base">Recent Dealer Invoices</CardTitle></CardHeader>
                    <CardContent>
                      <InvoiceTable invoices={receivablesInvoices.slice(0,5)} />
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
        
        <Card>
          <CardHeader>
            <CardTitle>Action Center</CardTitle>
            <CardDescription>Tasks requiring your attention.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
              <div>
                  <h4 className="text-sm font-semibold mb-2">Items for Approval (3)</h4>
                  <div className="text-xs space-y-2 text-muted-foreground">
                      <div className="flex justify-between"><span>Invoice #INV-V008 from Global Mart</span> <Button size="sm" variant="outline" className="h-6">Review</Button></div>
                      <div className="flex justify-between"><span>Invoice #INV-D009 from Quick Stop</span> <Button size="sm" variant="outline" className="h-6">Review</Button></div>
                      <div className="flex justify-between"><span>New Partner: 'Urban Grocers'</span> <Button size="sm" variant="outline" className="h-6">Review</Button></div>
                  </div>
              </div>
              <Separator />
               <div>
                  <h4 className="text-sm font-semibold mb-2 text-destructive">Overdue Alerts (1)</h4>
                  <div className="text-xs space-y-2 text-muted-foreground">
                      <div className="flex justify-between"><span>Invoice #INV-V002 from Fresh Foods Inc. is 3 days overdue.</span> <Button size="sm" variant="outline" className="h-6">View</Button></div>
                  </div>
              </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}


function InvoiceTable({ invoices }: { invoices: typeof payablesInvoices }) {
  return (
    <ScrollArea className="h-60">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice #</TableHead>
            <TableHead>Partner</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => (
            <TableRow key={invoice.id} className="h-10">
              <TableCell className="p-2 font-medium">{invoice.invoiceNumber}</TableCell>
              <TableCell className="p-2">{invoice.vendorName || invoice.dealerName}</TableCell>
              <TableCell className="p-2 text-right">{formatCurrency(invoice.amount)}</TableCell>
              <TableCell className="p-2"><StatusBadge status={invoice.status} /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
  );
}
