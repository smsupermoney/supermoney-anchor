import PageHeader from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { invoices, programs, retailers } from "@/lib/data";
import { IndianRupee, FileText, AlertTriangle, Clock, Activity, ArrowRight, Library, Users, UploadCloud, CheckCircle, CalendarClock } from "lucide-react";
import StatusBadge from "@/components/status-badge";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

export default function Dashboard() {
  const totalCreditLimit = 2000000;
  const utilizedCredit = 1400000;
  
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


  const totalRetailers = retailers.length;
  const activeRetailers = retailers.filter(r => r.status === 'Active').length;
  const pendingRetailers = retailers.filter(r => r.status === 'Pending').length;

  return (
    <div className="flex flex-col h-full gap-4">
      <PageHeader title="Dashboard">
        <Button>
          <UploadCloud className="mr-2 h-4 w-4" />
          Raise Invoice
        </Button>
      </PageHeader>
      
      {/* Top Row Carousel */}
      <Carousel
        opts={{
          align: "start",
          dragFree: true,
        }}
        className="w-full"
      >
        <CarouselContent className="gap-4 -ml-0">
            {/* Card 1: Credit Overview */}
            <CarouselItem className="basis-full sm:basis-1/2 md:basis-1/2 lg:basis-1/3 xl:basis-1/4 pl-0">
                <Card className="h-full">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-semibold">Credit Overview</CardTitle>
                        <IndianRupee className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex items-baseline justify-between">
                                <span className="text-xs text-muted-foreground">Total Limit</span>
                                <span className="text-sm font-semibold">{formatCurrency(totalCreditLimit)}</span>
                            </div>
                            <div className="flex items-baseline justify-between">
                                <span className="text-xs text-muted-foreground">Utilized</span>
                                <span className="text-sm font-semibold">{formatCurrency(utilizedCredit)}</span>
                            </div>
                            <div className="flex items-baseline justify-between">
                                <span className="text-xs text-muted-foreground">Available</span>
                                <span className="text-sm font-semibold text-primary">{formatCurrency(totalCreditLimit - utilizedCredit)}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </CarouselItem>
            {/* Card 2: Invoice Summary */}
            <CarouselItem className="basis-full sm:basis-1/2 md:basis-1/2 lg:basis-1/3 xl:basis-1/4 pl-0">
                <Card className="h-full">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-semibold">Invoice Summary</CardTitle>
                        <FileText className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
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
            </CarouselItem>
            {/* Card 3: Upcoming Payments */}
            <CarouselItem className="basis-full sm:basis-1/2 md:basis-1/2 lg:basis-1/3 xl:basis-1/4 pl-0">
                <Card className="h-full">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-semibold">Upcoming Payments</CardTitle>
                        <CalendarClock className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{formatCurrency(upcomingPaymentsAmount)}</p>
                        <p className="text-xs text-muted-foreground">Across {upcomingPaymentsCount} invoices in next 30 days</p>
                    </CardContent>
                </Card>
            </CarouselItem>
            {/* Card 4: Disbursal Summary */}
            <CarouselItem className="basis-full sm:basis-1/2 md:basis-1/2 lg:basis-1/3 xl:basis-1/4 pl-0">
                 <Card className="h-full">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-semibold">Disbursal Summary</CardTitle>
                        <CheckCircle className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{formatCurrency(disbursedAmount)}</p>
                        <p className="text-xs text-muted-foreground">Total across {disbursedCount} invoices</p>
                    </CardContent>
                </Card>
            </CarouselItem>
            {/* Card 5: Retailer Summary */}
             <CarouselItem className="basis-full sm:basis-1/2 md:basis-1/2 lg:basis-1/3 xl:basis-1/4 pl-0">
                <Card className="h-full">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-semibold">Retailers Summary</CardTitle>
                        <Users className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-y-2">
                            <div className="flex flex-col items-center">
                                <span className="text-lg font-bold">{totalRetailers}</span>
                                <span className="text-xs text-muted-foreground">Total</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <span className="text-lg font-bold">{activeRetailers}</span>
                                <span className="text-xs text-muted-foreground">Active</span>
                            </div>
                             <div className="flex flex-col items-center col-span-2">
                                <span className="text-lg font-bold">{pendingRetailers}</span>
                                <span className="text-xs text-muted-foreground">Pending</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </CarouselItem>
        </CarouselContent>
      </Carousel>
      
      {/* Program Overview Carousel */}
      <div className="w-full">
        <h2 className="text-xl font-bold tracking-tight mb-2">Program Overview</h2>
        <Carousel
          opts={{
            align: "start",
            dragFree: true,
          }}
          className="w-full"
        >
          <CarouselContent className="gap-4 -ml-0">
            {programs.map((program) => {
              const utilizationPercentage = (program.usedLimit / program.totalLimit) * 100;
              const remainingLimit = program.totalLimit - program.usedLimit;

              return (
                <CarouselItem key={program.id} className="basis-full sm:basis-1/2 md:basis-1/2 lg:basis-1/3 xl:basis-1/4 pl-0">
                  <Card className="h-full">
                    <CardHeader>
                      <CardTitle className="text-sm">{program.lenderName}</CardTitle>
                      <CardDescription>Total Limit: {formatCompactCurrency(program.totalLimit)}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0 flex flex-col gap-2">
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
                            <p className="text-[10px] text-muted-foreground">Total Retailers</p>
                            <p className="font-semibold text-xs">{program.totalRetailers}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] text-muted-foreground">Total Overdue</p>
                            <p className="font-semibold text-xs">{program.overdueCount}</p>
                        </div>
                      </div>
                      <Separator />
                      <Button variant="outline" size="sm" className="hover:bg-primary hover:text-primary-foreground">
                        <UploadCloud className="mr-2 h-4 w-4" />
                        Raise Invoice
                      </Button>
                    </CardContent>
                  </Card>
                </CarouselItem>
              );
            })}
          </CarouselContent>
        </Carousel>
      </div>

      {/* Recent Invoices */}
      <div className="flex-1 min-h-0">
          <Card className="h-full flex flex-col">
              <CardHeader>
                  <CardTitle className="text-xl font-semibold">Recent Invoices</CardTitle>
              </CardHeader>
              <CardContent className="p-0 flex-1">
                <ScrollArea className="h-full">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice #</TableHead>
                        <TableHead>Retailer</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoices.slice(0, 10).map((invoice) => (
                        <TableRow key={invoice.id}>
                          <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                          <TableCell>{invoice.retailerName}</TableCell>
                          <TableCell>{invoice.date}</TableCell>
                          <TableCell className="text-right">{formatCurrency(invoice.amount)}</TableCell>
                          <TableCell><StatusBadge status={invoice.status} /></TableCell>
                          <TableCell>
                            <Button asChild variant="ghost" size="icon">
                                <Link href={`/invoices/${invoice.id}`}>
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
          </Card>
      </div>
    </div>
  );
}
