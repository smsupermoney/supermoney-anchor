
"use client";

import { useState } from "react";
import PageHeader from "@/components/page-header";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { invoices, programs, leads } from "@/lib/data";
import { IndianRupee, FileText, Ban, Clock, UploadCloud, CheckCircle, AlertTriangle, Users, Target, UserX, UserCheck, HandCoins, PlusCircle, HelpCircle, Mail } from "lucide-react";
import StatusBadge from "@/components/status-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import UploadInvoiceDialog from "@/components/upload-invoice-dialog";
import type { Invoice } from "@/types";
import InvoiceDetailDialog from "@/components/invoice-detail-dialog";
import Link from "next/link";
import { subDays } from "date-fns";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";


export default function Dashboard() {
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const supermoneyPrograms = programs.filter(p => p.lenderType === 'Supermoney');
  const externalPrograms = programs.filter(p => p.lenderType === 'External');

  const supermoneyTotalLimit = supermoneyPrograms.reduce((sum, p) => sum + p.totalLimit, 0);
  const supermoneyUtilizedCredit = supermoneyPrograms.reduce((sum, p) => sum + p.usedLimit, 0);

  const externalTotalLimit = externalPrograms.reduce((sum, p) => sum + p.totalLimit, 0);
  const externalUtilizedCredit = externalPrograms.reduce((sum, p) => sum + p.usedLimit, 0);
  
  const totalCreditLimit = supermoneyTotalLimit + externalTotalLimit;
  const utilizedCredit = supermoneyUtilizedCredit + externalUtilizedCredit;
  
  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount).replace('₹', '₹ ');
  const formatCompactCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', notation: 'compact' }).format(amount);


  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const sevenDaysAgo = subDays(today, 7);

  const invoicesLast7Days = invoices.filter(
    (i) => new Date(i.date) >= sevenDaysAgo && new Date(i.date) <= today
  );

  const totalLast7Days = invoicesLast7Days.length;
  const disbursedLast7Days = invoicesLast7Days.filter(i => i.status === 'Disbursed').length;
  const pendingLast7Days = invoicesLast7Days.filter(i => ['Initiated', 'Approved', 'Sent to Lender'].includes(i.status)).length;
  const rejectedLast7Days = invoicesLast7Days.filter(i => i.status === 'Rejected').length;

  const overdueInvoices = invoices.filter((i) => i.overdueAmount > 0);
  const totalOverdueAmount = overdueInvoices.reduce((sum, i) => sum + i.overdueAmount, 0);
  const overdueInvoicesCount = overdueInvoices.length;
  const dealersInOverdue = new Set(overdueInvoices.map(i => i.dealerName)).size;
  
  // Lead Summary Calculations
  const leadsLast7Days = leads.filter(l => new Date(l.createdAt) >= sevenDaysAgo && new Date(l.createdAt) <= today);
  const totalPendingLeads = leads.filter(l => !['PSD Completed', 'Dropped'].includes(l.status)).length;
  const convertedLeadsLast7Days = leadsLast7Days.filter(l => l.status === 'PSD Completed').length;
  const needsAttentionLeads = leads.filter(l => ['KYC', 'Credit', 'Operations'].includes(l.status)).length;
  const rejectedLeadsLast7Days = leads.filter(l => l.status === 'Dropped').length;

  const disbursedAmountLast7Days = invoicesLast7Days
    .filter(i => i.status === 'Disbursed')
    .reduce((sum, i) => sum + i.amount, 0);


  return (
    <div className="flex flex-col h-full gap-4">
      <PageHeader title="Dashboard">
        <UploadInvoiceDialog>
            <Button size="sm">
            <UploadCloud className="mr-2 h-4 w-4" />
            Raise Invoice
            </Button>
        </UploadInvoiceDialog>
      </PageHeader>
      
      {/* Top Row Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="lg:col-span-1 h-full">
            <CardHeader className="flex flex-row items-center justify-between p-3 pb-2">
                <CardTitle className="text-sm font-semibold">Credit Overview</CardTitle>
                <IndianRupee className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-3 pt-0 text-xs">
                <div className="space-y-2">
                    <div>
                        <h4 className="font-semibold mb-1 text-primary">Supermoney</h4>
                        <div className="space-y-1">
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Total Limit</span>
                                <span className="font-medium">{formatCurrency(supermoneyTotalLimit)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Utilized</span>
                                <span className="font-medium">{formatCurrency(supermoneyUtilizedCredit)}</span>
                            </div>
                        </div>
                    </div>
                    <Separator className="my-2" />
                    <div>
                        <h4 className="font-semibold mb-1">External Lenders</h4>
                        <div className="space-y-1">
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Total Limit</span>
                                <span className="font-medium">{formatCurrency(externalTotalLimit)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Utilized</span>
                                <span className="font-medium">{formatCurrency(externalUtilizedCredit)}</span>
                            </div>
                        </div>
                    </div>
                    <Separator className="my-2"/>
                    <div>
                        <h4 className="font-bold mb-1">Total</h4>
                        <div className="space-y-1">
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Total Limit</span>
                                <span className="font-semibold">{formatCurrency(totalCreditLimit)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Utilized</span>
                                <span className="font-semibold">{formatCurrency(utilizedCredit)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Available</span>
                                <span className="font-semibold text-primary">{formatCurrency(totalCreditLimit - utilizedCredit)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>

        <div className="grid grid-cols-1 grid-rows-2 gap-4">
            <Card className="h-full">
                <CardHeader className="flex flex-row items-center justify-between p-3 pb-2">
                    <CardTitle className="text-sm font-semibold">Overdue Summary</CardTitle>
                    <AlertTriangle className="w-4 h-4 text-destructive" />
                </CardHeader>
                <CardContent className="p-3 pt-0">
                    <p className="text-2xl font-bold text-destructive">{formatCurrency(totalOverdueAmount)}</p>
                    <p className="text-xs text-muted-foreground">Across {overdueInvoicesCount} invoices from {dealersInOverdue} dealers</p>
                </CardContent>
            </Card>
            <Card className="h-full">
                <CardHeader className="flex flex-row items-center justify-between p-3 pb-2">
                    <CardTitle className="text-sm font-semibold">Invoice Summary <span className="text-xs font-normal text-muted-foreground">(Last 7 Days)</span></CardTitle>
                    <FileText className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="p-3 pt-0">
                    <div className="grid grid-cols-2 gap-y-2">
                        <div className="flex flex-col items-center">
                            <span className="text-lg font-bold">{totalLast7Days}</span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1"><FileText className="w-3 h-3" /> Total</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-lg font-bold text-green-600">{disbursedLast7Days}</span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Disbursed</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-lg font-bold text-yellow-600">{pendingLast7Days}</span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" /> Pending</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-lg font-bold text-destructive">{rejectedLast7Days}</span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1"><Ban className="w-3 h-3" /> Rejected</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
          
        <div className="grid grid-cols-1 grid-rows-2 gap-4">
            <Card className="h-full">
                <CardHeader className="flex flex-row items-center justify-between p-3 pb-2">
                    <CardTitle className="text-sm font-semibold">Lead Summary</CardTitle>
                    <Users className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="p-3 pt-0">
                      <div className="grid grid-cols-2 gap-y-2">
                        <div className="flex flex-col items-center">
                            <span className="text-lg font-bold">{totalPendingLeads}</span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" /> Pending</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-lg font-bold text-green-600">{convertedLeadsLast7Days}</span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1"><UserCheck className="w-3 h-3" /> Converted (7d)</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-lg font-bold text-yellow-600">{needsAttentionLeads}</span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1"><Target className="w-3 h-3" /> Needs Attention</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-lg font-bold text-destructive">{rejectedLast7Days}</span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1"><UserX className="w-3 h-3" /> Rejected (7d)</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
              <Card className="h-full">
                <CardHeader className="flex flex-row items-center justify-between p-3 pb-2">
                    <CardTitle className="text-sm font-semibold">Quick Actions</CardTitle>
                     <HelpCircle className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="p-3 pt-0 flex flex-col gap-2">
                    <Button variant="outline" size="sm" className="w-full justify-start text-left">
                        <HandCoins className="mr-2 h-4 w-4" />
                        Request for additional limit
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start text-left" asChild>
                        <Link href="/leads">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add new lead
                        </Link>
                    </Button>
                    <Separator />
                    <div className="text-xs text-muted-foreground text-center px-1">
                        Have any query? <a href="mailto:nitin.chorge@supermoney.in" className="text-primary hover:underline font-medium">Send us an email</a>
                    </div>
                </CardContent>
            </Card>
        </div>
        
        <div className="grid grid-cols-1 grid-rows-2 gap-4">
             {/* This is a placeholder for the fourth column to balance the grid. 
                 You can add more summary cards here in the future. 
                 For now, we can leave it empty or add some other info.
                 Or we can change the lg:grid-cols-4 to lg:grid-cols-3 if we only have 3 columns of content.
                 Let's assume for now we might add a 4th column of cards.
             */}
        </div>
      </div>
      
      {/* Program Overview */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {programs.map((program) => {
          const utilizationPercentage = (program.usedLimit / program.totalLimit) * 100;
          const remainingLimit = program.totalLimit - program.usedLimit;

          return (
            <div key={program.id} className="min-w-0">
              <Card className="w-full flex flex-col h-full">
                <CardHeader className="p-3 pb-2">
                  <div className="flex justify-between items-start">
                    <div className="min-w-0">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <CardTitle className="text-sm truncate">{program.lenderName}</CardTitle>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{program.lenderName}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <CardDescription className="text-xs">Total Limit: {formatCompactCurrency(program.totalLimit)}</CardDescription>
                    </div>
                    <Badge variant={program.lenderType === 'Supermoney' ? 'default' : 'secondary'} className="text-xs shrink-0">{program.lenderType}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-3 pt-0 flex flex-col gap-2 flex-1">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium">Used: {formatCompactCurrency(program.usedLimit)}</span>
                      <span className="text-muted-foreground">Available: {formatCompactCurrency(remainingLimit)}</span>
                    </div>
                    <Progress value={utilizationPercentage} className="h-2" />
                  </div>
                  <Separator />
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                    <Link href={`/invoices?lender=${encodeURIComponent(program.lenderName)}`} className="space-y-0 hover:bg-secondary p-1 rounded-md transition-colors">
                      <p className="text-[10px] text-muted-foreground">Invoices</p>
                      <p className="font-semibold text-xs">{program.invoicesCount}</p>
                    </Link>
                    <div className="space-y-0 p-1 rounded-md">
                      <p className="text-[10px] text-muted-foreground">Disbursed</p>
                      <p className="font-semibold text-xs">{formatCompactCurrency(program.disbursedAmount)}</p>
                    </div>
                    <Link href={`/retailers?lender=${encodeURIComponent(program.lenderName)}`} className="space-y-0 hover:bg-secondary p-1 rounded-md transition-colors">
                      <p className="text-[10px] text-muted-foreground">Total Dealers</p>
                      <p className="font-semibold text-xs">{program.totalDealers}</p>
                    </Link>
                    <div className="space-y-0 p-1 rounded-md">
                      <p className="text-[10px] text-muted-foreground">Total Overdue</p>
                      <p className="font-semibold text-xs">{program.overdueCount}</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="p-3 pt-0">
                  <UploadInvoiceDialog defaultLender={program.lenderName}>
                    <Button variant="outline" size="sm" className="w-full hover:bg-primary hover:text-primary-foreground">
                      <UploadCloud className="mr-2 h-4 w-4" />
                      Raise Invoice
                    </Button>
                  </UploadInvoiceDialog>
                </CardFooter>
              </Card>
            </div>
          );
        })}
      </div>

      {/* Recent Invoices */}
      <div className="flex-1 min-h-0">
          <Card className="h-full flex flex-col">
              <CardHeader className="p-3">
                  <CardTitle className="text-base font-semibold">Recent Invoices</CardTitle>
              </CardHeader>
              <CardContent className="p-0 flex-1">
                <div className="relative w-full overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice #</TableHead>
                        <TableHead>Dealer</TableHead>
                        <TableHead>Lender</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="text-right">Overdue</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoices.slice(0, 10).map((invoice) => (
                        <TableRow key={invoice.id} className="h-10 cursor-pointer" onClick={() => setSelectedInvoice(invoice)}>
                          <TableCell className="p-2 font-medium">{invoice.invoiceNumber}</TableCell>
                          <TableCell className="p-2">{invoice.dealerName}</TableCell>
                          <TableCell className="p-2">{invoice.lender}</TableCell>
                          <TableCell className="p-2">{invoice.date}</TableCell>
                          <TableCell className="p-2 text-right">{formatCurrency(invoice.amount)}</TableCell>
                          <TableCell className="p-2 text-right text-destructive">{invoice.overdueAmount > 0 ? formatCurrency(invoice.overdueAmount) : '-'}</TableCell>
                          <TableCell className="p-2"><StatusBadge status={invoice.status} /></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
          </Card>
      </div>

      {selectedInvoice && (
        <InvoiceDetailDialog 
            invoice={selectedInvoice} 
            open={!!selectedInvoice} 
            onOpenChange={(open) => {
                if(!open) setSelectedInvoice(null);
            }} 
        />
      )}
    </div>
  );
}
