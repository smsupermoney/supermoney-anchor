import PageHeader from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { invoices } from "@/lib/data";
import { ArrowUp, IndianRupee, FileText } from "lucide-react";
import StatusBadge from "@/components/status-badge";
import { ProgramPerformanceChart } from "@/components/charts";
import CreditUtilizationChart from "@/components/credit-utilization-chart";

export default function Dashboard() {
  const totalCreditLimit = 2000000;
  const utilizedCredit = 1400000;
  
  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

  return (
    <>
      <PageHeader title="Dashboard" />
      <div className="grid gap-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
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
              <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{invoices.length}</div>
              <p className="text-xs text-muted-foreground">+2 from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Disbursed</CardTitle>
              <IndianRupee className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(1250000)}</div>
              <p className="text-xs text-muted-foreground">+10% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
               <ArrowUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(40000)}</div>
               <p className="text-xs text-muted-foreground">3 invoices awaiting approval</p>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-6">
            <ProgramPerformanceChart />
            <Card>
                <CardHeader>
                    <CardTitle>Recent Invoices</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Invoice #</TableHead>
                                <TableHead>Retailer</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {invoices.slice(0, 5).map((invoice) => (
                                <TableRow key={invoice.id}>
                                    <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                                    <TableCell>{invoice.retailerName}</TableCell>
                                    <TableCell>{formatCurrency(invoice.amount)}</TableCell>
                                    <TableCell><StatusBadge status={invoice.status} /></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
      </div>
    </>
  );
}
