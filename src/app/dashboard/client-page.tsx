
"use client";

import { useMemo, useState, useEffect } from "react";
import PageHeader from "@/components/page-header";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { IndianRupee, FileText, Ban, Clock, UploadCloud, CheckCircle, AlertTriangle, Users, Target, UserX, UserCheck, HandCoins, PlusCircle, HelpCircle, ArrowRight, CalendarClock, Activity, MessageSquare } from "lucide-react";
import StatusBadge from "@/components/status-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import UploadInvoiceDialog from "@/components/upload-invoice-dialog";
import type { Invoice, Program, Dealer, MomentumDealerLead } from "@/types";
import InvoiceDetailDialog from "@/components/invoice-detail-dialog";
import Link from "next/link";
import { subDays, startOfDay, addDays, formatISO } from "date-fns";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import AiChat from "@/components/ai-chat";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import RequestLimitDialog from "@/components/request-limit-dialog";
import SendQueryDialog from "@/components/send-query-dialog";
import { useAuth } from "@/context/auth-context";
import BulkInvoiceUploadDialog from "@/components/bulk-invoice-upload-dialog";
import OverdueNoticeDialog from "@/components/overdue-notice-dialog";

type DashboardClientProps = {
  initialPrograms: Program[];
  initialInvoices: Invoice[];
  dealers: Dealer[];
  momentumLeads: MomentumDealerLead[];
  totalOverdueAmount: number;
};

export default function DashboardClient({ initialPrograms, initialInvoices, dealers, momentumLeads, totalOverdueAmount }: DashboardClientProps) {
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [programs] = useState(initialPrograms);
  const [invoices] = useState(initialInvoices);
  const { user } = useAuth();
  
  const [pageIndex, setPageIndex] = useState(0);
  const pageSize = 5; // Smaller page size for dashboard view
  const [isOverdueNoticeOpen, setOverdueNoticeOpen] = useState(false);

  const overdueDealers = useMemo(() => dealers.filter(d => d.overdueAmount > 0), [dealers]);

  useEffect(() => {
    if (overdueDealers.length > 0) {
      setOverdueNoticeOpen(true);
    }
  }, [overdueDealers]);


  const supermoneyPrograms = programs.filter(p => p.lenderType === 'Supermoney');
  const externalPrograms = programs.filter(p => p.lenderType === 'External');

  const supermoneyTotalLimit = supermoneyPrograms.reduce((sum, p) => sum + (p.totalLimit || 0), 0);
  const supermoneyUtilizedCredit = supermoneyPrograms.reduce((sum, p) => sum + (p.usedLimit || 0), 0);

  const externalTotalLimit = externalPrograms.reduce((sum, p) => sum + (p.totalLimit || 0), 0);
  const externalUtilizedCredit = externalPrograms.reduce((sum, p) => sum + (p.usedLimit || 0), 0);
  
  const totalCreditLimit = supermoneyTotalLimit + externalTotalLimit;
  const utilizedCredit = supermoneyUtilizedCredit + externalUtilizedCredit;
  
  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount).replace('₹', '₹ ');
  const formatCompactCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', notation: 'compact' }).format(amount);

  const today = startOfDay(new Date());
  const sevenDaysAgo = subDays(today, 6); // To include today, we go back 6 days
  
  const dateFilterParams = `dateFrom=${formatISO(sevenDaysAgo)}&dateTo=${formatISO(today)}`;

  const invoicesLast7Days = invoices.filter((i) => {
    const invoiceDate = startOfDay(new Date(i.date));
    return invoiceDate >= sevenDaysAgo && invoiceDate <= today;
  });
  
  const totalLast7Days = invoicesLast7Days.length;
  const disbursedLast7Days = invoicesLast7Days.filter(i => i.status === 'Disbursed').length;
  const pendingLast7Days = invoicesLast7Days.filter(i => ['Initiated', 'Approved', 'Sent to Lender'].includes(i.status)).length;
  const rejectedLast7Days = invoicesLast7Days.filter(i => i.status === 'Rejected').length;

  const overdueDealersCount = dealers.filter((d) => d.overdueAmount > 0).length;
  
  // Lead Summary Calculations from momentumLeads
  const totalLeads = momentumLeads.length;
  const newLeadsCount = momentumLeads.filter(l => (l.status || '').toLowerCase() === 'new').length;
  const followUpLeads = momentumLeads.filter(l => (l.status || '').toLowerCase() === 'follow up').length;
  const onboardingLeads = momentumLeads.filter(l => (l.status || '').toLowerCase() === 'onboarding').length;
  const disbursedLeads = momentumLeads.filter(l => (l.status || '').toLowerCase() === 'disbursed').length;
  const rejectedLeads = momentumLeads.filter(l => (l.status || '').toLowerCase() === 'rejected').length;


  const disbursedAmountLast7Days = invoicesLast7Days
    .filter(i => i.status === 'Disbursed')
    .reduce((sum, i) => sum + i.amount, 0);

  const lenderFullNameMapping: Record<string, string> = {
    'CHOLAMANDALAM INVESTMENT AND FINANCE COMPANY LIMITED': 'CHOLAMANDALAM INVESTMENT AND FINANCE COMPANY LIMITED',
    'ADITYA BIRLA CAPITAL LTD': 'ADITYA BIRLA CAPITAL LTD',
    'Supply Chain Finance Co.': 'Supply Chain Finance Co.',
    'Flexi Loans': 'Flexi Loans',
    'Supermoney Finance': 'Supermoney Finance'
  };

  const upcomingPayments = useMemo(() => {
    const today = new Date();
    const upcomingInvoices = invoices.filter(i => new Date(i.dueDate) >= today && i.status !== 'Disbursed' && (i.overdueAmount ?? 0) === 0);

    const calcTotal = (days: number) => {
        const endDate = addDays(today, days);
        return upcomingInvoices
            .filter(i => new Date(i.dueDate) <= endDate)
            .reduce((sum, i) => sum + i.amount, 0);
    };

    return {
        next7Days: calcTotal(7),
        next15Days: calcTotal(15),
        next30Days: calcTotal(30),
    };
  }, [invoices]);
  
  const recentInvoicesPageData = useMemo(() => {
    const start = pageIndex * pageSize;
    const end = start + pageSize;
    return invoices.slice(start, end);
  }, [invoices, pageIndex, pageSize]);

  const pageCount = Math.ceil(invoices.length / pageSize);


  return (
    <div className="flex flex-col h-full gap-4">
      <PageHeader title="Dashboard">
        <div className="flex items-center gap-2">
            <BulkInvoiceUploadDialog />
            <UploadInvoiceDialog dealers={dealers}>
                <Button size="sm">
                <UploadCloud className="mr-2 h-4 w-4" />
                Raise Invoice
                </Button>
            </UploadInvoiceDialog>
        </div>
      </PageHeader>
      
      <OverdueNoticeDialog
        open={isOverdueNoticeOpen}
        onOpenChange={setOverdueNoticeOpen}
        overdueDealers={overdueDealers}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Credit Overview */}
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
        
        {/* Summary Column */}
        <div className="flex flex-col gap-4">
            <Link href="/retailers?overdue=yes">
              <Card className="flex-1 hover:bg-secondary transition-colors">
                  <CardHeader className="flex flex-row items-center justify-between p-3 pb-2">
                      <CardTitle className="text-sm font-semibold">Overdue Summary</CardTitle>
                      <AlertTriangle className="w-4 h-4 text-destructive" />
                  </CardHeader>
                  <CardContent className="p-3 pt-0">
                      <p className="text-xl font-bold text-destructive">{formatCurrency(totalOverdueAmount)}</p>
                      <p className="text-xs text-muted-foreground">Across {overdueDealersCount} dealers</p>
                  </CardContent>
              </Card>
            </Link>
            <Card className="flex-1">
                <CardHeader className="flex flex-row items-center justify-between p-3 pb-2">
                    <CardTitle className="text-sm font-semibold">Upcoming Payments</CardTitle>
                    <CalendarClock className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="p-3 pt-0 text-xs space-y-2">
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Next 7 days</span>
                        <span className="font-semibold">{formatCurrency(upcomingPayments.next7Days)}</span>
                    </div>
                     <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Next 15 days</span>
                        <span className="font-semibold">{formatCurrency(upcomingPayments.next15Days)}</span>
                    </div>
                     <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Next 30 days</span>
                        <span className="font-semibold">{formatCurrency(upcomingPayments.next30Days)}</span>
                    </div>
                </CardContent>
            </Card>
            <Card className="flex-1">
                <CardHeader className="flex flex-row items-center justify-between p-3 pb-2">
                    <CardTitle className="text-sm font-semibold">Invoice Summary (7d)</CardTitle>
                    <FileText className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="p-3 pt-0">
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-center">
                        <Link href={`/invoices?${dateFilterParams}`} className="flex flex-col hover:bg-secondary rounded-md p-1 transition-colors">
                            <span className="font-bold">{totalLast7Days}</span>
                            <span className="text-[10px] text-muted-foreground flex items-center justify-center gap-1"><FileText className="w-3 h-3" /> Total</span>
                        </Link>
                        <Link href={`/invoices?status=Disbursed&${dateFilterParams}`} className="flex flex-col hover:bg-secondary rounded-md p-1 transition-colors">
                            <span className="font-bold">{disbursedLast7Days}</span>
                            <span className="text-[10px] text-muted-foreground flex items-center justify-center gap-1"><CheckCircle className="w-3 h-3" /> Disbursed</span>
                        </Link>
                        <Link href={`/invoices?status=Initiated,Approved,Sent to Lender&${dateFilterParams}`} className="flex flex-col hover:bg-secondary rounded-md p-1 transition-colors">
                            <span className="font-bold">{pendingLast7Days}</span>
                            <span className="text-[10px] text-muted-foreground flex items-center justify-center gap-1"><Clock className="w-3 h-3" /> Pending</span>
                        </Link>
                        <Link href={`/invoices?status=Rejected&${dateFilterParams}`} className="flex flex-col hover:bg-secondary rounded-md p-1 transition-colors">
                            <span className="font-bold">{rejectedLast7Days}</span>
                            <span className="text-[10px] text-muted-foreground flex items-center justify-center gap-1"><Ban className="w-3 h-3" /> Rejected</span>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
        
        {/* Lead and Quick Actions Column */}
        <div className="flex flex-col gap-4">
            <Card className="h-full">
                <CardHeader className="flex flex-row items-center justify-between p-3 pb-2">
                    <CardTitle className="text-sm font-semibold">Lead Summary</CardTitle>
                    <Target className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="p-3 pt-0">
                    <div className="grid grid-cols-3 gap-2">
                        <Link href="/leads" className="flex flex-col items-center p-2 rounded-md hover:bg-secondary transition-colors">
                            <span className="text-lg font-bold">{totalLeads}</span>
                            <span className="text-xs text-muted-foreground flex items-center text-center gap-1"><Users className="w-3 h-3" /> Total Leads</span>
                        </Link>
                         <Link href="/leads?status=New" className="flex flex-col items-center p-2 rounded-md hover:bg-secondary transition-colors">
                            <span className="text-lg font-bold">{newLeadsCount}</span>
                            <span className="text-xs text-muted-foreground flex items-center text-center gap-1"><UserCheck className="w-3 h-3" /> New</span>
                        </Link>
                        <Link href="/leads?status=Follow up" className="flex flex-col items-center p-2 rounded-md hover:bg-secondary transition-colors">
                            <span className="text-lg font-bold">{followUpLeads}</span>
                            <span className="text-xs text-muted-foreground flex items-center text-center gap-1"><Activity className="w-3 h-3" /> Follow Up</span>
                        </Link>
                         <Link href="/leads?status=Onboarding" className="flex flex-col items-center p-2 rounded-md hover:bg-secondary transition-colors">
                            <span className="text-lg font-bold">{onboardingLeads}</span>
                            <span className="text-xs text-muted-foreground flex items-center text-center gap-1"><Users className="w-3 h-3" /> Onboarding</span>
                        </Link>
                        <Link href="/leads?status=Disbursed" className="flex flex-col items-center p-2 rounded-md hover:bg-secondary transition-colors">
                            <span className="text-lg font-bold">{disbursedLeads}</span>
                            <span className="text-xs text-muted-foreground flex items-center text-center gap-1"><HandCoins className="w-3 h-3" /> Disbursed</span>
                        </Link>
                        <Link href="/leads?status=Rejected" className="flex flex-col items-center p-2 rounded-md hover:bg-secondary transition-colors">
                            <span className="text-lg font-bold">{rejectedLeads}</span>
                            <span className="text-xs text-muted-foreground flex items-center text-center gap-1"><UserX className="w-3 h-3" /> Rejected</span>
                        </Link>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between p-3 pb-2">
                    <CardTitle className="text-sm font-semibold">Quick Actions</CardTitle>
                    <HelpCircle className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="p-3 pt-0 flex flex-col gap-2">
                    <Button asChild variant="outline" size="sm" className="w-full justify-start text-left">
                        <Link href="/add-lead">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add Lead
                        </Link>
                    </Button>
                    <RequestLimitDialog dealers={dealers}>
                        <Button variant="outline" size="sm" className="w-full justify-start text-left">
                            <HandCoins className="mr-2 h-4 w-4" />
                            Request for additional limit
                        </Button>
                    </RequestLimitDialog>
                    <Separator />
                     <SendQueryDialog>
                        <Button variant="link" size="sm" className="w-full justify-center text-center text-xs h-auto p-1">
                            <MessageSquare className="mr-2 h-3 w-3"/>
                            Have a query? Send us a message
                        </Button>
                    </SendQueryDialog>
                </CardContent>
            </Card>
        </div>
        
        {/* AI Assistant */}
        <div className="lg:col-span-1">
          <AiChat />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <Card>
            <CardHeader>
                <CardTitle className="text-base font-semibold">Program Overview</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="relative w-full overflow-auto">
                    <div className="overflow-x-auto">
                        <div className="flex space-x-4 pb-4">
                            {programs.map((program) => {
                            const utilizationPercentage = (program.totalLimit && program.totalLimit > 0) ? ((program.usedLimit || 0) / program.totalLimit) * 100 : 0;
                            const remainingLimit = (program.totalLimit || 0) - (program.usedLimit || 0);
                            const fullName = lenderFullNameMapping[program.lenderName] || program.lenderName;

                            return (
                                <div key={program.id} className="w-[320px] shrink-0">
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
                                                <p>{fullName}</p>
                                            </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                        <CardDescription className="text-xs">Total Limit: {formatCompactCurrency(program.totalLimit || 0)}</CardDescription>
                                        </div>
                                        <Badge variant={program.lenderType === 'Supermoney' ? 'default' : 'secondary'} className="text-xs shrink-0">{program.lenderType}</Badge>
                                    </div>
                                    </CardHeader>
                                    <CardContent className="p-3 pt-0 flex flex-col gap-2 flex-1">
                                    <div>
                                        <div className="flex justify-between text-xs mb-1">
                                        <span className="font-medium">Used: {formatCompactCurrency(program.usedLimit || 0)}</span>
                                        <span className="text-muted-foreground">Available: {formatCompactCurrency(remainingLimit)}</span>
                                        </div>
                                        <Progress value={utilizationPercentage} className="h-2" />
                                    </div>
                                    <Separator />
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                                        <Link href={`/invoices?lender=${encodeURIComponent(program.lenderName)}&status=Disbursed`} className="space-y-0 hover:bg-secondary p-1 rounded-md transition-colors">
                                        <p className="text-[10px] text-muted-foreground">Disbursed Invoices</p>
                                        <p className="font-semibold text-xs">{program.disbursedInvoicesCount}</p>
                                        </Link>
                                        <Link href={`/invoices?lender=${encodeURIComponent(program.lenderName)}&status=Initiated`} className="space-y-0 hover:bg-secondary p-1 rounded-md transition-colors">
                                        <p className="text-[10px] text-muted-foreground">Initiated Invoices</p>
                                        <p className="font-semibold text-xs">{program.initiatedInvoicesCount}</p>
                                        </Link>
                                        <Link href={`/retailers?lender=${encodeURIComponent(program.lenderName)}`} className="space-y-0 hover:bg-secondary p-1 rounded-md transition-colors">
                                        <p className="text-[10px] text-muted-foreground">Total Dealers</p>
                                        <p className="font-semibold text-xs">{program.totalDealers}</p>
                                        </Link>
                                        <Link href={`/invoices?lender=${encodeURIComponent(program.lenderName)}&overdue=yes`} className="space-y-0 hover:bg-secondary p-1 rounded-md transition-colors">
                                        <p className="text-[10px] text-muted-foreground">Overdue Invoices</p>
                                        <p className="font-semibold text-xs text-destructive">{program.overdueCount}</p>
                                        </Link>
                                    </div>
                                    </CardContent>
                                    <CardFooter className="p-3 pt-0">
                                    <UploadInvoiceDialog dealers={dealers} defaultLender={program.lenderName}>
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
                    </div>
                </div>
            </CardContent>
        </Card>

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
                        <TableHead>UTR #</TableHead>
                        <TableHead>Dealer</TableHead>
                        <TableHead>Lender</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="text-right">Overdue</TableHead>
                        <TableHead>Status</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {recentInvoicesPageData.map((invoice) => (
                        <TableRow key={invoice.id} className="h-10 cursor-pointer" onClick={() => setSelectedInvoice(invoice)}>
                            <TableCell className="p-2 font-medium text-primary">
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className="truncate max-w-[100px]">{invoice.invoiceNumber}</div>
                                        </TooltipTrigger>
                                        <TooltipContent><p>{invoice.invoiceNumber}</p></TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </TableCell>
                            <TableCell className="p-2">
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className="truncate max-w-[120px]">{invoice.utrNo || '-'}</div>
                                        </TooltipTrigger>
                                        <TooltipContent><p>{invoice.utrNo || 'N/A'}</p></TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </TableCell>
                            <TableCell className="p-2">
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                             <Link href={`/invoices?dealerName=${encodeURIComponent(invoice.dealerName ?? '')}`} className="hover:underline truncate max-w-[120px] block" onClick={(e) => e.stopPropagation()}>
                                                {invoice.dealerName}
                                            </Link>
                                        </TooltipTrigger>
                                        <TooltipContent><p>{invoice.dealerName}</p></TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </TableCell>
                            <TableCell className="p-2">
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Link href={`/invoices?lender=${encodeURIComponent(invoice.lender ?? '')}`} className="hover:underline truncate max-w-[120px] block" onClick={(e) => e.stopPropagation()}>
                                                {invoice.lender}
                                            </Link>
                                        </TooltipTrigger>
                                        <TooltipContent><p>{lenderFullNameMapping[invoice.lender ?? ''] || invoice.lender}</p></TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </TableCell>
                            <TableCell className="p-2">
                                 <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className="truncate max-w-[100px]">{invoice.date}</div>
                                        </TooltipTrigger>
                                        <TooltipContent><p>{invoice.date}</p></TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </TableCell>
                            <TableCell className="p-2 text-right">
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className="truncate max-w-[100px]">{formatCurrency(invoice.amount)}</div>
                                        </TooltipTrigger>
                                        <TooltipContent><p>{formatCurrency(invoice.amount)}</p></TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </TableCell>
                            <TableCell className="p-2 text-right text-destructive">
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className="truncate max-w-[100px]">{invoice.overdueAmount && invoice.overdueAmount > 0 ? formatCurrency(invoice.overdueAmount) : '-'}</div>
                                        </TooltipTrigger>
                                        <TooltipContent><p>{invoice.overdueAmount && invoice.overdueAmount > 0 ? formatCurrency(invoice.overdueAmount) : '-'}</p></TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </TableCell>
                            <TableCell className="p-2 whitespace-nowrap">
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div><StatusBadge status={invoice.status} /></div>
                                        </TooltipTrigger>
                                        <TooltipContent><p>{invoice.status}</p></TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
                </div>
            </CardContent>
             <CardFooter className="p-3 justify-between border-t items-center">
                 <DataTablePagination
                    pageIndex={pageIndex}
                    pageCount={pageCount}
                    setPageIndex={setPageIndex}
                    hasNextPage={pageIndex < pageCount - 1}
                    hasPreviousPage={pageIndex > 0}
                />
                <Button asChild variant="ghost" size="sm">
                    <Link href="/invoices">
                        View All Invoices
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </CardFooter>
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
