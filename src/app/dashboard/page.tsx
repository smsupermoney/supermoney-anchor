import PageHeader from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { invoices } from "@/lib/data";
import { IndianRupee, FileText, AlertTriangle, Clock, Activity } from "lucide-react";

export default function Dashboard() {
  const totalCreditLimit = 2000000;
  const utilizedCredit = 1400000;
  const availableCredit = totalCreditLimit - utilizedCredit;
  
  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', notation: 'compact', maximumFractionDigits: 1 }).format(amount).replace(/\.0(?=\D)/, '');

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const overdueInvoicesCount = invoices.filter(
    (i) =>
    new Date(i.dueDate) < today &&
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

  const disbursedAmount = invoices
    .filter(i => i.status === 'Disbursed')
    .reduce((sum, inv) => sum + inv.amount, 0);

  return (
    <>
      <PageHeader title="Dashboard" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium">Credit Overview</CardTitle>
              <IndianRupee className="h-4 w-4 text-muted-foreground" />
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
                    <span className="text-sm font-semibold text-primary">{formatCurrency(availableCredit)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium">Invoice Summary</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-y-2">
                <div className="flex flex-col items-center">
                    <span className="text-sm font-bold">{invoices.length}</span>
                    <span className="text-xs text-muted-foreground">Total</span>
                </div>
                <div className="flex flex-col items-center">
                    <span className="text-sm font-bold">{activeInvoicesCount}</span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1"><Activity className="h-3 w-3" /> Active</span>
                </div>
                <div className="flex flex-col items-center">
                    <span className="text-sm font-bold">{pendingApprovalCount}</span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" /> Pending</span>
                </div>
                <div className="flex flex-col items-center">
                    <span className="text-sm font-bold text-destructive">{overdueInvoicesCount}</span>
                    <span className="text-destructive flex items-center gap-1 text-xs font-medium"><AlertTriangle className="h-3 w-3" /> Overdue</span>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium">Total Disbursed</CardTitle>
              <IndianRupee className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-bold">{formatCurrency(disbursedAmount)}</div>
              <p className="text-xs text-muted-foreground">+10% from last month</p>
            </CardContent>
          </Card>
        
        <div className="lg:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Program Performance</CardTitle>
                </CardHeader>
                <CardContent>
                    {/* This would be a real chart in a real app */}
                    <img data-ai-hint="invoice data bar chart" src="https://placehold.co/600x400.png" alt="Program Performance Chart" className="w-full h-auto rounded-md" />
                </CardContent>
            </Card>
        </div>
        <div className="lg:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Recent Invoices</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">No invoices to display.</p>
                </CardContent>
            </Card>
        </div>
      </div>
    </>
  );
}
