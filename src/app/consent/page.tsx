"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { processConsent } from "./actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { IndianRupee, Loader2, CheckCircle2, XCircle, AlertCircle, FileText } from "lucide-react";
import { db1 } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Separator } from "@/components/ui/separator";

export default function ConsentPage() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const initialAction = searchParams.get("action") as 'Approved' | 'Rejected' | null;
    
    const [status, setStatus] = useState<'loading' | 'valid' | 'success' | 'error' | 'expired' | 'used'>('loading');
    const [invoiceData, setInvoiceData] = useState<any>(null);
    const [message, setMessage] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    
    const hasAutoProcessed = useRef(false);

    useEffect(() => {
        const validateAndProcess = async () => {
            if (!token) {
                setStatus('error');
                setMessage("Invalid Link.");
                return;
            }

            try {
                const docRef = doc(db1, "invoiceConsents", token);
                const snap = await getDoc(docRef);

                if (!snap.exists()) {
                    setStatus('error');
                    setMessage("Invalid Link.");
                    return;
                }

                const data = snap.data();
                if (data.status !== 'Pending') {
                    setStatus('used');
                    setMessage(data.status === 'Approved' ? "Already Approved." : "Already Rejected.");
                    return;
                }

                if (new Date(data.expiryTime) < new Date()) {
                    setStatus('expired');
                    setMessage("Link Expired.");
                    return;
                }

                setInvoiceData(data);
                
                // If user came with an action parameter, auto-process it immediately
                if (initialAction && (initialAction === 'Approved' || initialAction === 'Rejected') && !hasAutoProcessed.current) {
                    hasAutoProcessed.current = true;
                    // Skip setting 'valid' status to avoid showing the review card
                    await handleAction(initialAction);
                } else {
                    setStatus('valid');
                }
            } catch (e) {
                setStatus('error');
                setMessage("Failed to validate link.");
            }
        };

        validateAndProcess();
    }, [token, initialAction]);

    const handleAction = async (action: 'Approved' | 'Rejected') => {
        if (!token) return;
        setIsProcessing(true);
        try {
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

    // Show loader if we are initial loading OR if we are processing an auto-action
    if (status === 'loading' || isProcessing) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                {initialAction && (
                    <p className="mt-4 text-sm font-medium animate-pulse">
                        {initialAction === 'Approved' ? "Approving invoice..." : "Rejecting invoice..."}
                    </p>
                )}
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
                                {new Intl.NumberFormat("en-IN").format(invoiceData?.amount || 0)}
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