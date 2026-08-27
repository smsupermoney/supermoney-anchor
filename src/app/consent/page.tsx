
"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { processConsent } from "./actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { IndianRupee, Loader2, CheckCircle2, XCircle, AlertCircle, FileText } from "lucide-react";
import { db1 } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Separator } from "@/components/ui/separator";

function ConsentContent() {
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

    if (status === 'loading' || isProcessing) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <Card className="w-full max-w-sm text-center shadow-2xl">
                    <CardContent className="pt-10 pb-10 flex flex-col items-center gap-4">
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                        <p className="text-sm font-medium text-muted-foreground">
                            {initialAction ? (initialAction === 'Approved' ? "Processing Approval..." : "Processing Rejection...") : "Validating Link..."}
                        </p>
                    </CardContent>
                </Card>
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
            <div className="min-h-screen flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <Card className="w-full max-w-sm text-center shadow-2xl animate-in zoom-in-95 duration-200">
                    <CardHeader>
                        <div className="flex justify-center mb-2">{renderIcon()}</div>
                        <CardTitle className="text-xl font-bold">{message}</CardTitle>
                    </CardHeader>
                    <CardFooter className="justify-center border-t bg-muted/20 py-4">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">You can safely close this window</p>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <Card className="w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
                <CardHeader className="text-center border-b bg-muted/10">
                    <CardTitle className="text-xl font-bold">Invoice Consent</CardTitle>
                    <CardDescription>Review the details and provide your confirmation.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                    <div className="bg-secondary/50 p-5 rounded-xl space-y-3 border border-border">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Invoice Number:</span>
                            <span className="font-bold text-foreground">{invoiceData?.invoiceNumber}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between items-baseline py-1">
                            <span className="text-muted-foreground">Amount:</span>
                            <span className="text-2xl font-black flex items-center text-primary">
                                <IndianRupee className="h-5 w-5 mr-0.5" />
                                {new Intl.NumberFormat("en-IN").format(invoiceData?.amount || 0)}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Due Date:</span>
                            <span className="font-bold text-foreground">{invoiceData?.dueDate}</span>
                        </div>
                    </div>
                    <div className="text-xs text-muted-foreground flex items-start gap-3 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                        <AlertCircle className="h-5 w-5 shrink-0 text-blue-500" />
                        <p className="leading-relaxed">By confirming, you authorize the processing of this invoice for financing. This action is final and will be logged with your timestamp and IP address.</p>
                    </div>
                </CardContent>
                <CardFooter className="flex gap-3 pt-2 pb-6 px-6">
                    <Button 
                        variant="outline" 
                        className="flex-1 h-11 font-bold" 
                        onClick={() => handleAction('Rejected')} 
                        disabled={isProcessing}
                    >
                        Reject
                    </Button>
                    <Button 
                        className="flex-1 h-11 font-bold" 
                        onClick={() => handleAction('Approved')} 
                        disabled={isProcessing}
                    >
                        Approve
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}

export default function ConsentPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-black/50 backdrop-blur-sm">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        }>
            <ConsentContent />
        </Suspense>
    );
}
