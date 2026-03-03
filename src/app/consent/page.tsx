"use client";

import { useEffect, useState, use } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { processConsent } from "./actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { IndianRupee, Loader2, CheckCircle2, XCircle, AlertCircle, FileText } from "lucide-react";
import { db1 } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Separator } from "@/components/ui/separator";

export default function ConsentPage() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const [status, setStatus] = useState<'loading' | 'valid' | 'success' | 'error' | 'expired' | 'used'>('loading');
    const [invoiceData, setInvoiceData] = useState<any>(null);
    const [message, setMessage] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        const validateToken = async () => {
            if (!token) {
                setStatus('error');
                setMessage("Invalid Link.");
                return;
            }

            try {
                const q = query(collection(db1, "invoiceConsents"), where("token", "==", token));
                const snap = await getDocs(q);

                if (snap.empty) {
                    setStatus('error');
                    setMessage("Invalid Link.");
                    return;
                }

                const data = snap.docs[0].data();
                if (data.status !== 'Pending') {
                    setStatus('used');
                    setMessage("Already Processed.");
                    return;
                }

                if (new Date(data.expiryTime) < new Date()) {
                    setStatus('expired');
                    setMessage("Link Expired.");
                    return;
                }

                // Fetch invoice details
                const invQ = query(collection(db1, "invoices"), where("invoiceNumber", "==", data.invoiceNumber));
                const invSnap = await getDocs(invQ);
                if (!invSnap.empty) {
                    setInvoiceData(invSnap.docs[0].data());
                }

                setStatus('valid');
            } catch (e) {
                setStatus('error');
                setMessage("Failed to validate link.");
            }
        };

        validateToken();
    }, [token]);

    const handleAction = async (action: 'Approved' | 'Rejected') => {
        if (!token) return;
        setIsProcessing(true);
        try {
            // In a real app, we'd get the IP from the server action properly
            const res = await processConsent(token, action, "N/A");
            if (res.success) {
                setStatus('success');
                setMessage(action === 'Approved' ? "Invoice approved successfully." : "Invoice has been rejected.");
            } else {
                setStatus('error');
                setMessage(res.error || "Action failed.");
            }
        } catch (e) {
            setStatus('error');
            setMessage("An error occurred.");
        } finally {
            setIsProcessing(false);
        }
    };

    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-muted/30">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const renderIcon = () => {
        switch (status) {
            case 'success': return <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />;
            case 'error':
            case 'expired':
            case 'used': return <XCircle className="h-12 w-12 text-destructive mx-auto" />;
            default: return <FileText className="h-12 w-12 text-primary mx-auto" />;
        }
    };

    if (status !== 'valid') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
                <Card className="w-full max-w-md text-center">
                    <CardHeader>
                        {renderIcon()}
                        <CardTitle className="mt-4">{message}</CardTitle>
                    </CardHeader>
                    <CardFooter className="justify-center">
                        <p className="text-sm text-muted-foreground">You can close this window now.</p>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle>Invoice Consent</CardTitle>
                    <CardDescription>Please review the invoice details and provide your consent.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="bg-secondary p-4 rounded-lg space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Invoice Number:</span>
                            <span className="font-semibold">{invoiceData?.invoiceNumber}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between items-baseline">
                            <span className="text-muted-foreground">Amount:</span>
                            <span className="text-xl font-bold flex items-center">
                                <IndianRupee className="h-4 w-4" />
                                {new Intl.NumberFormat("en-IN").format(invoiceData?.amount)}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Due Date:</span>
                            <span className="font-medium">{invoiceData?.dueDate}</span>
                        </div>
                    </div>
                    <div className="text-xs text-muted-foreground flex items-start gap-2 bg-blue-50 p-3 rounded-md border border-blue-100">
                        <AlertCircle className="h-4 w-4 shrink-0 text-blue-500" />
                        <p>By clicking approve, you authorize Supermoney to process this invoice for financing with the respective lender.</p>
                    </div>
                </CardContent>
                <CardFooter className="flex gap-3">
                    <Button 
                        variant="outline" 
                        className="flex-1" 
                        onClick={() => handleAction('Rejected')} 
                        disabled={isProcessing}
                    >
                        Reject
                    </Button>
                    <Button 
                        className="flex-1" 
                        onClick={() => handleAction('Approved')} 
                        disabled={isProcessing}
                    >
                        {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Approve
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}