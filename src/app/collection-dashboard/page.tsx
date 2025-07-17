
"use client";

import { useState } from "react";
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, MoreVertical } from "lucide-react";
import type { Repayment } from "@/types";
import AddRepaymentDialog from "@/components/add-repayment-dialog";
import StatusBadge from "@/components/status-badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";


export default function CollectionDashboardPage() {
    const [repayments, setRepayments] = useState<Repayment[]>([]);
    const { toast } = useToast();

    const formatCurrency = (amount?: number) => {
        if (typeof amount !== 'number') return "N/A";
        return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount);
    };

    const handleAddRepayment = (newRepaymentData: Omit<Repayment, 'id' | 'status' | 'link' | 'amountRepaid'>) => {
        const newRepayment: Repayment = {
            id: `REPAY-${Date.now()}`,
            ...newRepaymentData,
            amountRepaid: 0,
            status: 'Link Sent',
            link: `https://repay.supermoney.in/${Date.now()}`
        };
        setRepayments(prev => [...prev, newRepayment]);
    };

    const handleResendLink = (invoiceId: string) => {
        toast({ title: "Link Resent", description: `A new repayment link for invoice #${invoiceId} has been sent.` });
    };

    const handleAmountPaid = (repaymentId: string) => {
        // Placeholder for a future dialog to enter paid amount
        toast({ title: "Action Required", description: "Functionality to update paid amount will be added." });
    }

    return (
        <>
            <PageHeader title="Collection Dashboard">
                <AddRepaymentDialog onAddRepayment={handleAddRepayment}>
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4"/>
                        Add Repayment
                    </Button>
                </AddRepaymentDialog>
            </PageHeader>
            <Card className="mt-4">
                <CardHeader>
                    <CardTitle>Repayment Tracking</CardTitle>
                    <CardDescription>
                        Track and manage invoice repayments and collections.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="relative w-full overflow-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Invoice ID</TableHead>
                                    <TableHead>Invoice Amount</TableHead>
                                    <TableHead>Due Date</TableHead>
                                    <TableHead>Contact Number</TableHead>
                                    <TableHead>Amount Repaid</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Link</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {repayments.length > 0 ? (
                                    repayments.map((repayment) => (
                                        <TableRow key={repayment.id}>
                                            <TableCell className="font-medium">{repayment.invoiceId}</TableCell>
                                            <TableCell>{formatCurrency(repayment.invoiceAmount)}</TableCell>
                                            <TableCell>{repayment.dueDate}</TableCell>
                                            <TableCell>{repayment.contactNumber}</TableCell>
                                            <TableCell>{formatCurrency(repayment.amountRepaid)}</TableCell>
                                            <TableCell><StatusBadge status={repayment.status} /></TableCell>
                                            <TableCell>
                                                <Button variant="link" asChild className="p-0 h-auto">
                                                    <a href={repayment.link} target="_blank" rel="noopener noreferrer">View Link</a>
                                                </Button>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => handleResendLink(repayment.invoiceId)}>
                                                            Resend Link
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleAmountPaid(repayment.id)}>
                                                            Amount Paid
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center text-muted-foreground">
                                            No repayments added yet.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </>
    );
}
