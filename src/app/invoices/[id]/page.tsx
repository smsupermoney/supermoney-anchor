import PageHeader from "@/components/page-header";
import ProgressTracker from "@/components/progress-tracker";
import StatusBadge from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { invoices, invoiceStatuses } from "@/lib/data";
import { notFound } from "next/navigation";
import { Download, Printer } from "lucide-react";

export default function InvoiceDetailPage({ params }: { params: { id: string } }) {
  const invoice = invoices.find(inv => inv.id === params.id);

  if (!invoice) {
    notFound();
  }
  
  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

  return (
    <>
      <PageHeader title={`Invoice ${invoice.invoiceNumber}`}>
        <div className="flex gap-2">
            <Button variant="outline"><Printer className="mr-2 h-4 w-4" /> Print</Button>
            <Button><Download className="mr-2 h-4 w-4" /> Download</Button>
        </div>
      </PageHeader>
      
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Invoice Lifecycle</CardTitle>
                </CardHeader>
                <CardContent>
                    <ProgressTracker steps={invoiceStatuses.filter(s => s !== 'Rejected')} currentStep={invoice.status} />
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Uploaded Documents</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between p-3 bg-secondary rounded-md">
                        <p className="font-medium">E-Way Bill</p>
                        <Button variant="outline" size="sm">View Document</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
        <div className="md:col-span-1">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle>Invoice Details</CardTitle>
                            <CardDescription>for {invoice.retailerName}</CardDescription>
                        </div>
                        <StatusBadge status={invoice.status} />
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Amount</span>
                        <span className="font-bold text-xl text-primary">{formatCurrency(invoice.amount)}</span>
                    </div>
                    <Separator />
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Invoice Date</span>
                            <span className="font-medium">{invoice.date}</span>
                        </div>
                         <div className="flex justify-between">
                            <span className="text-muted-foreground">Due Date</span>
                            <span className="font-medium">{invoice.dueDate}</span>
                        </div>
                         <div className="flex justify-between">
                            <span className="text-muted-foreground">E-Way Bill #</span>
                            <span className="font-medium">{invoice.eWayBillNumber}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </>
  );
}