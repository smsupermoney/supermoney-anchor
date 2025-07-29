
"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import PageHeader from "@/components/page-header";
import ProgressTracker from "@/components/progress-tracker";
import StatusBadge from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { invoiceStatuses } from "@/lib/data";
import { Download, Eye } from "lucide-react";
import type { Invoice } from "@/types";
import Link from "next/link";

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
                    {invoice.invoiceImage && (
                        <div className="flex gap-2 pr-8">
                            <Button asChild variant="outline"><Link href={invoice.invoiceImage} target="_blank"><Eye className="mr-2 h-4 w-4" /> View Document</Link></Button>
                            <Button asChild><Link href={invoice.invoiceImage} download><Download className="mr-2 h-4 w-4" /> Download</Link></Button>
                        </div>
                    )}
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
                {invoice.invoiceImage && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Uploaded Document</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between p-3 bg-secondary rounded-md">
                                <p className="font-medium truncate">Invoice Document</p>
                                <Button asChild variant="outline" size="sm">
                                    <Link href={invoice.invoiceImage} target="_blank" rel="noopener noreferrer">
                                        View Document
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}
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
                                <span className="font-medium">{invoice.lender || 'N/A'}</span>
                            </div>
                             <div className="flex justify-between">
                                <span className="text-muted-foreground">UTR #</span>
                                <span className="font-medium">{invoice.utrNo || 'N/A'}</span>
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
                                <span className="text-muted-foreground">Overdue Amount</span>
                                <span className="font-medium text-destructive">{invoice.overdueAmount && invoice.overdueAmount > 0 ? formatCurrency(invoice.overdueAmount) : "-"}</span>
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
