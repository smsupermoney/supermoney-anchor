"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { InvoiceDocument } from "@/types";

interface InvoiceConsentDialogProps {
    open: boolean;
    onClose: () => void;
    document: InvoiceDocument[];
    onVerified: () => Promise<void>;
}

type OtpFormValues = { otp: string };

export function InvoiceConsentDialog({
    open,
    onClose,
    document,
    onVerified,
}: InvoiceConsentDialogProps) {
    const [otpState, setOtpState] = useState({
        transactionCode: "",
        expiresAt: null as Date | null,
        remainingAttempts: 3,
        isVerifying: false,
        resendCooldown: 60,
        lockoutUntil:
            typeof window !== "undefined" && localStorage.getItem("otpLockoutUntil")
                ? new Date(localStorage.getItem("otpLockoutUntil")!)
                : null,
    });
    const [otpTick, setOtpTick] = useState(0);

    const updateOtpState = (updates: Partial<typeof otpState>) =>
        setOtpState((prev) => ({ ...prev, ...updates }));

    const { toast } = useToast();

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<OtpFormValues>();

    const otpExpiresIn = otpState.expiresAt
        ? Math.max(0, Math.floor((otpState.expiresAt.getTime() - Date.now()) / 1000))
        : 1800;

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60)
            .toString()
            .padStart(2, "0");
        const s = (seconds % 60).toString().padStart(2, "0");
        return `${m}:${s}`;
    };

    const generateOtp = async () => {
        try {
            const { data } = await axios.post(
                "https://livegateway.supermoney.in/supermoney-service/send/mobile/otp/v2",
                {
                    mobileNo: null,
                    otpFor: "invoiceConsent",
                    userId: document[0].applicationId,
                    userType: "Application",
                    amount: document[0].disburseAmount,
                    invoiceId: document[0].extractedData.invoiceNumber,
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            if (data.successFlag) {
                updateOtpState({
                    transactionCode: data.transactionCode,
                    expiresAt: new Date(Date.now() + 30 * 60 * 1000),
                    remainingAttempts: [0, 3].includes(otpState.remainingAttempts) ? 3 : otpState.remainingAttempts,
                    resendCooldown: 60,
                });
                reset();
                toast({
                    title: "OTP Sent",
                    description: "OTP has been sent to the customer's registered mobile number.",
                });
            }
        } catch {
            toast({
                variant: "destructive",
                title: "Failed to Send OTP",
                description: "Please try again.",
            });
            onClose()
        }
    };

    const verifyOtp = async ({ otp }: OtpFormValues) => {
        if (otpState.lockoutUntil && otpState.lockoutUntil > new Date()) {
            toast({
                variant: "destructive",
                title: "Locked Out for 10 Minutes",
                description: "Please wait 10 min before retrying.",
            });
            return;
        }

        updateOtpState({ isVerifying: true });

        try {
            const { data } = await axios.post(
                "https://livegateway.supermoney.in/supermoney-service/send/verify/otp/v2",
                {
                    mobileNo: "",
                    otpFor: "invoiceConsent",
                    otp,
                    transactionCode: otpState.transactionCode,
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            if (data.successFlag) {
                toast({
                    title: "Verified",
                    description: "Invoice submitted successfully.",
                });

                await onVerified();
                onClose();
            } else {
                const newAttempts = data.remainingAttempts ?? otpState.remainingAttempts - 1;
                updateOtpState({ remainingAttempts: newAttempts });

                toast({
                    variant: "destructive",
                    title: "Invalid OTP",
                    description: data.error?.[0]?.errorMessage || "Please try again.",
                });

                if (newAttempts < 1) {
                    const lockoutTime = new Date(Date.now() + 10 * 60 * 1000);
                    localStorage.setItem("otpLockoutUntil", lockoutTime.toISOString());
                    updateOtpState({ lockoutUntil: lockoutTime });
                    toast({
                        variant: "destructive",
                        title: "Too Many Attempts",
                        description: "Try again after 10 minutes.",
                    });
                }
            }
        } catch {
            toast({
                variant: "destructive",
                title: "Verification Failed",
                description: "Could not verify OTP.",
            });
        } finally {
            updateOtpState({ isVerifying: false });
        }
    };

    useEffect(() => {
        const timer = setInterval(() => {
            // ⏱ Resend cooldown
            if (otpState.resendCooldown > 0) {
                updateOtpState({ resendCooldown: otpState.resendCooldown - 1 });
            }

            // ⏳ OTP expiry tick (forces re-render)
            setOtpTick((prev) => prev + 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [otpState.expiresAt, otpState.resendCooldown]);

    useEffect(() => {
        if (open) {
            generateOtp();
            reset()
        }
    }, [open]);

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <form onSubmit={handleSubmit(verifyOtp)} className="space-y-4">
                    <DialogTitle>Customer Consent</DialogTitle>
                    <DialogDescription>
                        OTP has been sent to the customer's registered mobile number before proceeding with invoice disbursement.
                    </DialogDescription>
                    <div>
                        <Label htmlFor="otp">Enter 6-digit OTP</Label>
                        <Input
                            id="otp"
                            className="mt-1"
                            type="text"
                            maxLength={6}
                            inputMode="numeric"
                            placeholder="------"
                            {...register("otp", {
                                required: "OTP is required",
                                pattern: {
                                    value: /^\d{6}$/,
                                    message: "Enter a valid 6-digit OTP",
                                },
                            })}
                        />
                        {errors.otp && <p className="text-xs text-red-500 mt-1">{errors.otp.message}</p>}
                        <div className="text-xs text-muted-foreground mt-1">
                            Expires in: {formatTime(otpExpiresIn)} | Attempts left: {otpState.remainingAttempts}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="ghost"
                            type="button"
                            onClick={generateOtp}
                            disabled={otpState.resendCooldown > 0}
                        >
                            {otpState.resendCooldown > 0 ? `Resend in ${otpState.resendCooldown}s` : "Resend OTP"}
                        </Button>
                        <Button type="submit" disabled={otpState.isVerifying} className={`${otpState.lockoutUntil as Date > new Date() ? 'bg-primary/50 hover:bg-primary/50' : ''}`}>
                            {otpState.isVerifying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Verify OTP
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
