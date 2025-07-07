import PageHeader from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { invoices } from "@/lib/data";
import { IndianRupee, FileText, AlertTriangle, Clock, Activity, ArrowRight } from "lucide-react";
import StatusBadge from "@/components/status-badge";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Dashboard() {
  const totalCreditLimit = 2000000;
  const utilizedCredit = 1400000;
  const availableCredit = totalCreditLimit - utilizedCredit;
  
  const formatCurrencyCompact = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', notation: 'compact', maximumFractionDigits: 1 }).format(amount).replace(/\.0(?=\D)/, '');
  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);


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

  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Dashboard" />
      <div className="flex-1 flex flex-col gap-4 pt-4">
        {/* Top Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold">Credit Overview</CardTitle>
              <IndianRupee className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-baseline justify-between">
                    <span className="text-[10px] text-muted-foreground">Total Limit</span>
                    <span className="text-xs font-semibold">{formatCurrencyCompact(totalCreditLimit)}</span>
                </div>
                <div className="flex items-baseline justify-between">
                    <span className="text-[10px] text-muted-foreground">Utilized</span>
                    <span className="text-xs font-semibold">{formatCurrencyCompact(utilizedCredit)}</span>
                </div>
                <div className="flex items-baseline justify-between">
                    <span className="text-[10px] text-muted-foreground">Available</span>
                    <span className="text-xs font-semibold text-primary">{formatCurrencyCompact(availableCredit)}</span>
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
        </div>

        {/* Bottom Row */}
        <div className="flex-1">
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
    </div>
  );
}
