import PageHeader from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { invoices, programs, retailers } from "@/lib/data";
import { IndianRupee, FileText, AlertTriangle, Clock, Activity, ArrowRight, Library, Users, PlusCircle } from "lucide-react";
import StatusBadge from "@/components/status-badge";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  const totalCreditLimit = 2000000;
  const utilizedCredit = 1400000;
  
  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount).replace('₹', '₹ ');


  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const overdueInvoicesCount = invoices.filter(
    (i) =>
    new Date(i.dueDate).getTime() < today.getTime() &&
    i.status !== "Disbursed" &&
    i.status !== "Rejected"
  ).length;

  const pendingApprovalInvoices = invoices.filter(
    i => i.status === 'Initiated' || i.status === 'Approved'
  );
  const pendingApprovalCount = pendingApprovalInvoices.length;

  const activeInvoicesCount = invoices.filter(
    i => i.status === 'Initiated' || i.status === 'Approved' || i.status === 'Sent to Lender'
  ).length;

  const totalPrograms = programs.length;
  const totalProgramLimit = programs.reduce((sum, p) => sum + p.totalLimit, 0);
  const totalRetailers = retailers.length;
  const activeRetailers = retailers.filter(r => r.status === 'Active').length;

  return (
    <div className="flex flex-col h-full gap-4">
      <PageHeader title="Dashboard" />
      
        {/* Top Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold">Credit Overview</CardTitle>
              <IndianRupee className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-baseline justify-between">
                    <span className="text-[10px] text-muted-foreground">Total Limit</span>
                    <span className="text-xs font-semibold">{formatCurrency(totalCreditLimit)}</span>
                </div>
                <div className="flex items-baseline justify-between">
                    <span className="text-[10px] text-muted-foreground">Utilized</span>
                    <span className="text-xs font-semibold">{formatCurrency(utilizedCredit)}</span>
                </div>
                <div className="flex items-baseline justify-between">
                    <span className="text-[10px] text-muted-foreground">Available</span>
                    <span className="text-xs font-semibold text-primary">{formatCurrency(totalCreditLimit - utilizedCredit)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold">Invoice Summary</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-y-2">
                <div className="flex flex-col items-center">
                    <span className="text-xs font-bold">{invoices.length}</span>
                    <span className="text-[10px] text-muted-foreground">Total</span>
                </div>
                <div className="flex flex-col items-center">
                    <span className="text-xs font-bold">{activeInvoicesCount}</span>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Activity className="h-3 w-3" /> Active</span>
                </div>
                <div className="flex flex-col items-center">
                    <span className="text-xs font-bold">{pendingApprovalCount}</span>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" /> Pending</span>
                </div>
                <div className="flex flex-col items-center">
                    <span className="text-xs font-bold text-destructive">{overdueInvoicesCount}</span>
                    <span className="text-destructive flex items-center gap-1 text-[10px] font-medium"><AlertTriangle className="h-3 w-3" /> Overdue</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold">Programs Summary</CardTitle>
              <Library className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-baseline justify-between">
                    <span className="text-[10px] text-muted-foreground">Total Programs</span>
                    <span className="text-xs font-semibold">{totalPrograms}</span>
                </div>
                <div className="flex items-baseline justify-between">
                    <span className="text-[10px] text-muted-foreground">Total Limit</span>
                    <span className="text-xs font-semibold">{formatCurrency(totalProgramLimit)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold">Retailers Summary</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-baseline justify-between">
                    <span className="text-[10px] text-muted-foreground">Total Retailers</span>
                    <span className="text-xs font-semibold">{totalRetailers}</span>
                </div>
                <div className="flex items-baseline justify-between">
                    <span className="text-[10px] text-muted-foreground">Active</span>
                    <span className="text-xs font-semibold">{activeRetailers}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Program Overview */}
        <div className="overflow-hidden">
          <h2 className="text-xs font-semibold mb-2">Program Overview</h2>
          <Carousel
            opts={{
              align: "start",
              dragFree: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {programs.map((program) => {
                const remainingLimit = program.totalLimit - program.usedLimit;
                return (
                  <CarouselItem key={program.id} className="pl-4 basis-4/5 sm:basis-1/2 lg:basis-1/3">
                    <Card className="flex flex-col h-full border">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-sm font-bold text-primary truncate w-4/5">{program.lenderName}</CardTitle>
                          <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">Active</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="p-0 flex-grow">
                        <div className="grid grid-cols-2 text-xs border-t">
                          <div className="p-3 border-r">
                            <p className="text-base font-bold">{program.activeDealers}</p>
                            <p className="text-muted-foreground underline cursor-pointer">Active Dealer Limits</p>
                          </div>
                          <div className="p-3 text-right">
                            <p className="text-muted-foreground">Available Program Limits</p>
                            <p className="text-base font-bold">{formatCurrency(program.totalLimit)}</p>
                          </div>
                          <div className="p-3 border-t border-r">
                            <p className="text-base font-bold">{formatCurrency(remainingLimit)}</p>
                            <p className="text-muted-foreground">Available</p>
                          </div>
                          <div className="p-3 border-t">
                            {/* This cell is empty in the design */}
                          </div>
                        </div>
                      </CardContent>
                      <div className="border-t mt-auto">
                        <Button variant="ghost" className="w-full justify-center text-primary font-semibold hover:bg-primary/5">
                          <PlusCircle className="mr-2 h-4 w-4" />
                          Raise Invoice(s)
                        </Button>
                      </div>
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
                    <CardTitle className="text-xs font-semibold">Recent Invoices</CardTitle>
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
                        {invoices.map((invoice) => (
                          <TableRow key={invoice.id}>
                            <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                            <TableCell>{invoice.retailerName}</TableCell>
                            <TableCell>{invoice.date}</TableCell>
                            <TableCell className="text-right">{formatCurrency(invoice.amount)}</TableCell>
                            <TableCell><StatusBadge status={invoice.status} /></TableCell>
                            <TableCell>
                              <Button asChild variant="ghost" size="icon">
                                  <Link href={`/invoices/${invoice.id}`}>
                                      <ArrowRight className="h-4 w-4" />
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
