import PageHeader from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { invoices } from "@/lib/data";
import { IndianRupee, FileText, AlertTriangle, Clock } from "lucide-react";
import CreditUtilizationChart from "@/components/credit-utilization-chart";

export default function Dashboard() {
  const totalCreditLimit = 2000000;
  const utilizedCredit = 1400000;
  
  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

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

  const disbursedAmount = invoices
    .filter(i => i.status === 'Disbursed')
    .reduce((sum, inv) => sum + inv.amount, 0);

  return (
    <>
      <PageHeader title="Dashboard" />
      <div className="grid gap-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Credit Limit Utilization</CardTitle>
              <CardDescription>Utilized: {formatCurrency(utilizedCredit)}</CardDescription>
            </CardHeader>
            <CardContent>
              <CreditUtilizationChart utilizedCredit={utilizedCredit} totalCreditLimit={totalCreditLimit} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Invoice Summary</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-baseline justify-between">
                    <span className="text-muted-foreground">Total Invoices</span>
                    <span className="text-xl font-bold">{invoices.length}</span>
                </div>
                <div className="flex items-baseline justify-between">
                    <span className="text-muted-foreground flex items-center gap-2"><Clock className="h-3 w-3" /> Pending</span>
                    <span className="text-xl font-bold">{pendingApprovalCount}</span>
                </div>
                <div className="flex items-baseline justify-between">
                    <span className="text-destructive flex items-center gap-2 font-medium"><AlertTriangle className="h-3 w-3" /> Overdue</span>
                    <span className="text-xl font-bold text-destructive">{overdueInvoicesCount}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Disbursed</CardTitle>
              <IndianRupee className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">{formatCurrency(disbursedAmount)}</div>
              <p className="text-xs text-muted-foreground">+10% from last month</p>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Recent Invoices</CardTitle>
                </CardHeader>
                <CardContent>
                    {/* This would be a real chart in a real app */}
                    <img data-ai-hint="invoice data bar chart" src="https://placehold.co/600x400.png" alt="Program Performance Chart" className="w-full h-auto rounded-md" />
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Recent Invoices</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">No invoices to display.</p>
                </CardContent>
            </Card>
        </div>
      </div>
    </>
  );
}