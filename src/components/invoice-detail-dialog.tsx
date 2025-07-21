"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import PageHeader from "@/components/page-header";
import ProgressTracker from "@/components/progress-tracker";
import StatusBadge from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { invoiceStatuses } from "@/lib/data";
import { Download, Printer } from "lucide-react";
import type { Invoice } from "@/types";

type InvoiceDetailDialogProps = {
  invoice: Invoice;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function InvoiceDetailDialog({ invoice, open, onOpenChange }: InvoiceDetailDialogProps) {
  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0">
        <DialogHeader className="p-6 pb-0">
            <DialogTitle>
                <PageHeader title={`Invoice ${invoice.invoiceNumber}`}>
                    <div className="flex gap-2 pr-8">
                        <Button variant="outline"><Printer className="mr-2 h-4 w-4" /> Print</Button>
                        <Button><Download className="mr-2 h-4 w-4" /> Download</Button>
                    </div>
                </PageHeader>
            </DialogTitle>
        </DialogHeader>
        <div className="grid md:grid-cols-3 gap-6 p-6">
            <div className="md:col-span-2 space-y-6">
                <Card>
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
                                <CardDescription>for {invoice.dealerName}</CardDescription>
                            </div>
                            <StatusBadge status={invoice.status} />
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Amount</span>
                            <span className="font-bold text-lg text-primary">{formatCurrency(invoice.amount)}</span>
                        </div>
                        <Separator />
                        <div className="space-y-2 text-xs">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Lender</span>
                                <span className="font-medium">{invoice.lender}</span>
                            </div>
                             <div className="flex justify-between">
                                <span className="text-muted-foreground">UTR #</span>
                                <span className="font-medium">{invoice.utrNumber || 'N/A'}</span>
                            </div>
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
                             <div className="flex justify-between">
                                <span className="text-muted-foreground">Overdue Amount</span>
                                <span className="font-medium text-destructive">{invoice.overdueAmount > 0 ? formatCurrency(invoice.overdueAmount) : "-"}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
      </div>
      </DialogContent>
    </Dialog>
  );
}
