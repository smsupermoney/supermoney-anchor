"use client";

import { useState } from "react";
import PageHeader from "@/components/page-header";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { invoices, programs, dealers } from "@/lib/data";
import { IndianRupee, FileText, AlertTriangle, Clock, Activity, ArrowRight, Library, Users, UploadCloud, CheckCircle, CalendarClock } from "lucide-react";
import StatusBadge from "@/components/status-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import UploadInvoiceDialog from "@/components/upload-invoice-dialog";
import type { Invoice } from "@/types";
import InvoiceDetailDialog from "@/components/invoice-detail-dialog";

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

  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(today.getDate() + 30);

  const overdueInvoicesCount = invoices.filter(
    (i) =>
    new Date(i.dueDate).getTime() < today.getTime() &&
    i.status !== "Disbursed" &&
    i.status !== "Rejected"
  ).length;

  const pendingApprovalCount = invoices.filter(
    i => i.status === 'Initiated' || i.status === 'Approved'
  ).length;

  const activeInvoicesCount = invoices.filter(
    i => i.status === 'Initiated' || i.status === 'Approved' || i.status === 'Sent to Lender'
  ).length;

  const upcomingPayments = invoices.filter(
    (i) =>
      i.status === "Disbursed" &&
      new Date(i.dueDate) >= today &&
      new Date(i.dueDate) <= thirtyDaysFromNow
  );
  const upcomingPaymentsCount = upcomingPayments.length;
  const upcomingPaymentsAmount = upcomingPayments.reduce((sum, i) => sum + i.amount, 0);
  
  const disbursedInvoices = invoices.filter(i => i.status === 'Disbursed');
  const disbursedCount = disbursedInvoices.length;
  const disbursedAmount = disbursedInvoices.reduce((sum, inv) => sum + inv.amount, 0);


  const totalDealers = dealers.length;
  const activeDealers = dealers.filter(r => r.status === 'Active').length;
  const pendingDealers = dealers.filter(r => r.status === 'Pending').length;

  return (
    <>
      <div className="flex flex-col h-full gap-4 p-2">
        <PageHeader title="Dashboard">
          <UploadInvoiceDialog>
            <Button size="sm">
              <UploadCloud className="mr-2 h-4 w-4" />
              Raise Invoice
            </Button>
          </UploadInvoiceDialog>
        </PageHeader>
        
        {/* Top Row Carousel */}
        <div className="relative group overflow-hidden">
          <Carousel
            opts={{
              align: "start",
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
                {/* Slide 1: Credit Overview */}
                <CarouselItem className="basis-full md:basis-1/2 lg:basis-1/3 pl-4">
                    <Card className="h-full flex flex-col">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 p-3">
                            <CardTitle className="text-sm font-semibold">Credit Overview</CardTitle>
                            <IndianRupee className="w-4 h-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent className="p-3 pt-0 text-xs flex-1">
                            <div className="space-y-3 h-full flex flex-col justify-around">
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
                                <Separator />
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
                                <Separator />
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
                </CarouselItem>
                
                {/* Slide 2: Invoice & Payments */}
                <CarouselItem className="basis-full md:basis-1/2 lg:basis-1/3 pl-4">
                  <div className="flex flex-col gap-4 h-full">
                      <Card>
                          <CardHeader className="flex flex-row items-center justify-between pb-2 p-3">
                              <CardTitle className="text-sm font-semibold">Invoice Summary</CardTitle>
                              <FileText className="w-4 h-4 text-muted-foreground" />
                          </CardHeader>
                          <CardContent className="p-3 pt-0">
                              <div className="grid grid-cols-2 gap-y-2">
                                  <div className="flex flex-col items-center">
                                      <span className="text-lg font-bold">{invoices.length}</span>
                                      <span className="text-xs text-muted-foreground">Total</span>
                                  </div>
                                  <div className="flex flex-col items-center">
                                      <span className="text-lg font-bold">{activeInvoicesCount}</span>
                                      <span className="text-xs text-muted-foreground flex items-center gap-1"><Activity className="w-3 h-3" /> Active</span>
                                  </div>
                                  <div className="flex flex-col items-center">
                                      <span className="text-lg font-bold">{pendingApprovalCount}</span>
                                      <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" /> Pending</span>
                                  </div>
                                  <div className="flex flex-col items-center">
                                      <span className="text-lg font-bold text-destructive">{overdueInvoicesCount}</span>
                                      <span className="text-destructive flex items-center gap-1 text-xs font-medium"><AlertTriangle className="w-3 h-3" /> Overdue</span>
                                  </div>
                              </div>
                          </CardContent>
                      </Card>
                      <Card>
                          <CardHeader className="flex flex-row items-center justify-between pb-2 p-3">
                              <CardTitle className="text-sm font-semibold">Upcoming Payments</CardTitle>
                              <CalendarClock className="w-4 h-4 text-muted-foreground" />
                          </CardHeader>
                          <CardContent className="p-3 pt-0">
                              <p className="text-2xl font-bold">{formatCurrency(upcomingPaymentsAmount)}</p>
                              <p className="text-xs text-muted-foreground">Across {upcomingPaymentsCount} invoices in next 30 days</p>
                          </CardContent>
                      </Card>
                  </div>
                </CarouselItem>

                {/* Slide 3: Disbursal & Dealers */}
                <CarouselItem className="basis-full md:basis-1/2 lg:basis-1/3 pl-4">
                  <div className="flex flex-col gap-4 h-full">
                      <Card>
                          <CardHeader className="flex flex-row items-center justify-between pb-2 p-3">
                              <CardTitle className="text-sm font-semibold">Disbursal Summary</CardTitle>
                              <CheckCircle className="w-4 h-4 text-muted-foreground" />
                          </CardHeader>
                          <CardContent className="p-3 pt-0">
                              <p className="text-2xl font-bold">{formatCurrency(disbursedAmount)}</p>
                              <p className="text-xs text-muted-foreground">Total across {disbursedCount} invoices</p>
                          </CardContent>
                      </Card>
                      <Card>
                          <CardHeader className="flex flex-row items-center justify-between pb-2 p-3">
                              <CardTitle className="text-sm font-semibold">Dealers Summary</CardTitle>
                              <Users className="w-4 h-4 text-muted-foreground" />
                          </CardHeader>
                          <CardContent className="p-3 pt-0">
                              <div className="grid grid-cols-2 gap-y-2">
                                  <div className="flex flex-col items-center">
                                      <span className="text-lg font-bold">{totalDealers}</span>
                                      <span className="text-xs text-muted-foreground">Total</span>
                                  </div>
                                  <div className="flex flex-col items-center">
                                      <span className="text-lg font-bold">{activeDealers}</span>
                                      <span className="text-xs text-muted-foreground">Active</span>
                                  </div>
                                  <div className="flex flex-col items-center col-span-2">
                                      <span className="text-lg font-bold">{pendingDealers}</span>
                                      <span className="text-xs text-muted-foreground">Pending</span>
                                  </div>
                              </div>
                          </CardContent>
                      </Card>
                  </div>
                </CarouselItem>
            </CarouselContent>
            <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 z-10 hidden md:flex hover:bg-primary hover:text-primary-foreground opacity-0 group-hover:opacity-100 disabled:opacity-0 disabled:hidden -translate-x-8 group-hover:translate-x-0 transition-all duration-300" />
            <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 z-10 hidden md:flex hover:bg-primary hover:text-primary-foreground opacity-0 group-hover:opacity-100 disabled:opacity-0 translate-x-8 group-hover:translate-x-0 transition-all duration-300" />
          </Carousel>
        </div>
        
        {/* Program Overview Carousel */}
        <div className="w-full">
          <h2 className="text-lg font-bold tracking-tight mb-2">Program Overview</h2>
          <div className="relative group overflow-hidden">
            <Carousel
              opts={{
                align: "start",
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-4">
                {programs.map((program) => {
                  const utilizationPercentage = (program.usedLimit / program.totalLimit) * 100;
                  const remainingLimit = program.totalLimit - program.usedLimit;

                  return (
                    <CarouselItem key={program.id} className="basis-full sm:basis-1/2 md:basis-1/2 lg:basis-1/3 xl:basis-1/4 pl-4">
                      <Card className="h-full flex flex-col">
                        <CardHeader className="p-3">
                          <div className="flex justify-between items-start">
                              <div>
                                  <CardTitle className="text-sm">{program.lenderName}</CardTitle>
                                  <CardDescription>Total Limit: {formatCompactCurrency(program.totalLimit)}</CardDescription>
                              </div>
                              <Badge variant={program.lenderType === 'Supermoney' ? 'default' : 'secondary'} className="text-xs">{program.lenderType}</Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0 flex flex-col gap-2 p-3 flex-1">
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="font-medium">Used: {formatCompactCurrency(program.usedLimit)}</span>
                              <span className="text-muted-foreground">Available: {formatCompactCurrency(remainingLimit)}</span>
                            </div>
                            <Progress value={utilizationPercentage} className="h-2" />
                          </div>
                          <Separator />
                          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                            <div className="space-y-1">
                                <p className="text-[10px] text-muted-foreground">Invoices</p>
                                <p className="font-semibold text-xs">{program.invoicesCount}</p>
                            </div>
                             <div className="space-y-1">
                                <p className="text-[10px] text-muted-foreground">Disbursed</p>
                                <p className="font-semibold text-xs">{formatCompactCurrency(program.disbursedAmount)}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] text-muted-foreground">Total Dealers</p>
                                <p className="font-semibold text-xs">{program.totalDealers}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] text-muted-foreground">Total Overdue</p>
                                <p className="font-semibold text-xs">{program.overdueCount}</p>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="p-3 pt-0">
                          <UploadInvoiceDialog>
                            <Button variant="outline" size="sm" className="w-full hover:bg-primary hover:text-primary-foreground">
                              <UploadCloud className="mr-2 h-4 w-4" />
                              Raise Invoice
                            </Button>
                          </UploadInvoiceDialog>
                        </CardFooter>
                      </Card>
                    </CarouselItem>
                  );
                })}
              </CarouselContent>
              <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 z-10 hidden md:flex hover:bg-primary hover:text-primary-foreground opacity-0 group-hover:opacity-100 disabled:opacity-0 disabled:hidden -translate-x-8 group-hover:translate-x-0 transition-all duration-300" />
              <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 z-10 hidden md:flex hover:bg-primary hover:text-primary-foreground opacity-0 group-hover:opacity-100 disabled:opacity-0 translate-x-8 group-hover:translate-x-0 transition-all duration-300" />
            </Carousel>
          </div>
        </div>

        {/* Recent Invoices */}
        <div className="flex-1 min-h-0">
            <Card className="h-full flex flex-col">
                <CardHeader className="p-3">
                    <CardTitle className="text-base font-semibold">Recent Invoices</CardTitle>
                </CardHeader>
                <CardContent className="p-0 flex-1">
                  <ScrollArea className="h-full">
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
                  </ScrollArea>
                </CardContent>
            </Card>
        </div>
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
    </>
  );
}
