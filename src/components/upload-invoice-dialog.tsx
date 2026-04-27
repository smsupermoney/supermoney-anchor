"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { UploadCloud, File as FileIcon, X, Loader2, Wand2, IndianRupee, AlertTriangle, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "./ui/card";
import { sendInvoiceEmail } from "@/app/add-invoice/email-actions";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import type { Dealer, InvoiceDocument, Program, PsbxLimitData } from "@/types";
import { InvoiceConsentDialog } from "./invoice-consent-dialog";
import { readInvoiceWithExternalApi } from "@/app/add-invoice/ocr-actions";
import { fetchPsbxLimit } from "@/app/retailers/psbx-actions";
import { db1 } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

type UploadInvoiceDialogProps = {
  children: React.ReactNode;
  defaultLender?: string;
  dealers: Dealer[];
};

type UploadedFile = {
  file: File;
  preview: string;
  extractedData?: any;
  disburseAmount?: string;
  isLoading: boolean;
  error?: string;
  overdueAmount?: number;
  availableLimit?: number;
  applicationId?: string;
  customerId?: string;
  psbxData?: PsbxLimitData;
  programId?: string;
};

export default function UploadInvoiceDialog({ children, dealers }: UploadInvoiceDialogProps) {
  const [open, setOpen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [consentOpen, setConsentOpen] = useState(false);
  const [limitErrorOpen, setLimitErrorOpen] = useState(false);
  
  // PSBX Error Dialog States
  const [psbxNpaErrorOpen, setPsbxNpaErrorOpen] = useState(false);
  const [psbxLimitStatusErrorOpen, setPsbxLimitStatusErrorOpen] = useState(false);
  const [psbxStatusErrorOpen, setPsbxStatusErrorOpen] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConsentRequired, setIsConsentRequired] = useState(false);
  const { toast } = useToast();
  
  const resetState = () => {
    setUploadedFiles([]);
    setIsDragging(false);
    setIsSubmitting(false);
    setLimitErrorOpen(false);
    setPsbxNpaErrorOpen(false);
    setPsbxLimitStatusErrorOpen(false);
    setPsbxStatusErrorOpen(false);
  };

  useEffect(() => {
    if (open) {
      resetState();
    }
  }, [open]);

  const fileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleAIExtraction = async (file: File, index: number) => {
    try {
      const documentDataUri = await fileToDataUri(file);
      const result = await readInvoiceWithExternalApi(file.name, documentDataUri);

      const dealer = dealers.find(d => d.GST === result.gstOrGstin);
      const overdueAmount = dealer?.overdueAmount;
      const applicationId = dealer?.applicationId;
      const customerId = dealer?.customerId;
      const availableLimit = dealer?.availableLimit;
      const programId = dealer?.programId;

      setUploadedFiles(prev => prev.map((f, i) => 
        i === index ? { 
            ...f, 
            extractedData: result, 
            isLoading: !programId, // If we have a program, we might still be loading PSBX
            disburseAmount: result.amount.toString(), 
            overdueAmount: overdueAmount,
            availableLimit: availableLimit,
            applicationId,
            customerId,
            programId
        } : f
      ));

      // Check if PSBX validation is required
      if (programId && applicationId) {
          const programDoc = await getDoc(doc(db1, "programs", programId));
          const programData = programDoc.data() as Program | undefined;

          if (programId === 'PROG011' || programData?.psbxEnabled) {
              const psbxResult = await fetchPsbxLimit(applicationId);
              setUploadedFiles(prev => prev.map((f, i) => 
                i === index ? { 
                    ...f, 
                    psbxData: psbxResult.data,
                    isLoading: false,
                    error: psbxResult.error ? `PSBX Error: ${psbxResult.error}` : f.error
                } : f
              ));
              return;
          }
      }

      // If not PSBX, finish loading
      setUploadedFiles(prev => prev.map((f, i) => i === index ? { ...f, isLoading: false } : f));

    } catch (error: any) {
      console.error("OCR Extraction Error:", error);
      setUploadedFiles(prev => prev.map((f, i) => 
        i === index ? { ...f, isLoading: false, error: error.message || "Failed to read document." } : f
      ));
    }
  };

  const handleFileChange = (newFiles: FileList | null) => {
    if (newFiles) {
      const addedFiles = Array.from(newFiles).map(file => ({
        file,
        preview: URL.createObjectURL(file),
        isLoading: true,
      }));
      
      const currentLength = uploadedFiles.length;
      setUploadedFiles(prev => [...prev, ...addedFiles]);

      addedFiles.forEach((newFile, i) => {
        handleAIExtraction(newFile.file, currentLength + i);
      });
    }
  };

  const handleDisburseAmountChange = (index: number, value: string) => {
    setUploadedFiles(prev => prev.map((f, i) => 
        i === index ? { ...f, disburseAmount: value } : f
    ));
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!uploadedFiles.length) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files);
      e.dataTransfer.clearData();
    }
  };

  const handleInvoiceConstent = () => {
    if (uploadedFiles.length === 0) {
      toast({ variant: "destructive", title: "No Files Uploaded", description: "Please upload at least one invoice document." });
      return;
    }

    if (uploadedFiles.some(f => f.isLoading)) {
      toast({ variant: "destructive", title: "Processing Files", description: "Please wait for the OCR and PSBX check to finish." });
      return;
    }

    // --- PSBX BLOCKING RULES ---
    for (const file of uploadedFiles) {
        if (file.psbxData) {
            const { lmsnpastatus, lmslimitstatus, lmsstatus } = file.psbxData;

            // Rule 1: NPA Check
            if (lmsnpastatus && lmsnpastatus !== 'No') {
                setPsbxNpaErrorOpen(true);
                return;
            }

            // Rule 2: Limit Approved Check
            if (lmslimitstatus && lmslimitstatus !== 'Approved') {
                setPsbxLimitStatusErrorOpen(true);
                return;
            }

            // Rule 3: Active Status Check
            if (lmsstatus && lmsstatus !== 'Active') {
                setPsbxStatusErrorOpen(true);
                return;
            }
        }
    }

    // Submission logic
    const anyConsentRequired = uploadedFiles.some(f => {
        const dealer = dealers.find(d => d.applicationId === f.applicationId);
        return dealer?.anchorId === "ANC008";
    });

    if (anyConsentRequired) {
      setIsConsentRequired(true);
      setConsentOpen(true);
    } else {
      setIsConsentRequired(false);
      handleSubmit();
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const emailDataPromises = uploadedFiles.map(async (upFile) => ({
          fileName: upFile.file.name,
          extractedData: upFile.extractedData,
          disburseAmount: upFile.disburseAmount ? Number(upFile.disburseAmount) : undefined,
          error: upFile.error,
          fileContent: await fileToDataUri(upFile.file),
          applicationId: upFile.applicationId,
          customerId: upFile.customerId,
      }));
      
      const emailData = await Promise.all(emailDataPromises);

      const result = await sendInvoiceEmail(emailData, isConsentRequired);

      if (result.error) {
          toast({
              variant: "destructive",
              title: "Failed to Send Email",
              description: result.error,
          });
      } else {
          toast({
              title: "Invoices Submitted",
              description: "The invoice details have been sent successfully.",
          });
          setOpen(false);
      }
    } catch (error) {
       toast({
          variant: "destructive",
          title: "An unexpected error occurred.",
          description: "Could not process files for submission. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount?: number) => {
    if (typeof amount !== 'number') return "N/A";
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Raise Invoice with OCR</DialogTitle>
            <DialogDescription>
              Upload invoice documents. The external OCR agent will automatically extract the details for you to review.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className={cn(
                "relative border-2 border-dashed border-muted-foreground/30 rounded-lg p-6 text-center transition-colors duration-200",
                isDragging ? "bg-accent" : "bg-transparent"
              )}
            >
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,application/pdf"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={(e) => handleFileChange(e.target.files)}
              />
              <div className="flex flex-col items-center justify-center space-y-2 text-muted-foreground">
                <UploadCloud className="w-10 h-10" />
                <p className="font-medium">
                  {isDragging ? "Drop files here" : "Drag & drop or click to upload"}
                </p>
                <p className="text-xs">PDF, PNG, or JPG files accepted.</p>
              </div>
            </div>

            {uploadedFiles.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Review Documents:</h4>
                <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                  {uploadedFiles.map((upFile, index) => {
                    const isPsbx = upFile.psbxData !== undefined;
                    const invoiceAmount = Number(upFile.disburseAmount || 0);
                    const psbxAvailable = upFile.psbxData?.availablelimit || 0;
                    const insufficientPsbxLimit = isPsbx && invoiceAmount > psbxAvailable;

                    return (
                      <Card key={index} className={cn("bg-background", isPsbx && "border-primary/20 bg-primary/5")}>
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3 flex-grow">
                                <FileIcon className="w-5 h-5 mt-1 shrink-0 text-muted-foreground" />
                                <div className="text-sm flex-grow">
                                    <div className="flex items-center gap-2">
                                        <p className="font-semibold truncate max-w-48" title={upFile.file.name}>{upFile.file.name}</p>
                                        {isPsbx && <Badge variant="outline" className="text-[10px] h-4 gap-1 px-1 border-primary/30 text-primary bg-primary/10"><ShieldCheck className="w-2.5 h-2.5"/> PSBX</Badge>}
                                    </div>
                                    
                                    {upFile.isLoading ? (
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                            <Loader2 className="w-3 h-3 animate-spin"/>
                                            <span>Processing...</span>
                                        </div>
                                    ) : upFile.error ? (
                                        <p className="text-xs text-destructive mt-1">{upFile.error}</p>
                                    ) : (
                                      <>
                                        <div className="grid grid-cols-2 gap-x-4 text-xs text-muted-foreground mt-2">
                                            <p><span className="font-medium text-foreground">Dealer:</span> {upFile.extractedData?.dealerName || 'N/A'}</p>
                                            <p><span className="font-medium text-foreground">Inv. Amount:</span> {formatCurrency(upFile.extractedData?.amount)}</p>
                                            <p><span className="font-medium text-foreground">Type:</span> {upFile.extractedData?.documentType || 'N/A'}</p>
                                            <p><span className="font-medium text-foreground">Due Date:</span> {upFile.extractedData?.dueDate || 'N/A'}</p>
                                        </div>
                                        
                                        <div className="mt-2">
                                          <div className="flex justify-between items-center mb-1">
                                            <Label htmlFor={`disburse-amount-${index}`} className="text-xs font-medium">Disburse Amount</Label>
                                            <span className="text-[10px] text-muted-foreground">
                                                {isPsbx ? `PSBX Available: ${formatCurrency(psbxAvailable)}` : `Available Limit: ${formatCurrency(upFile.availableLimit)}`}
                                            </span>
                                          </div>
                                          <div className="relative">
                                              <IndianRupee className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground"/>
                                              <Input 
                                                id={`disburse-amount-${index}`}
                                                type="number"
                                                className={cn(
                                                  "h-8 pl-6 text-xs",
                                                  (Number(upFile.disburseAmount || 0) > (upFile.availableLimit ?? 0) || insufficientPsbxLimit) && "border-destructive focus-visible:ring-destructive"
                                                )}
                                                value={upFile.disburseAmount}
                                                onChange={(e) => handleDisburseAmountChange(index, e.target.value)}
                                                placeholder="Enter amount"
                                              />
                                          </div>
                                          
                                          {/* Rule 4: Insufficient PSBX Limit Warning (Non-blocking) */}
                                          {insufficientPsbxLimit && (
                                            <p className="text-[10px] text-destructive mt-1 font-medium bg-destructive/10 p-1 rounded">
                                                Repay old dues to get the invoice disbursed.
                                            </p>
                                          )}
                                          
                                          {/* Standard Limit Exceeded Warning */}
                                          {!isPsbx && Number(upFile.disburseAmount || 0) > (upFile.availableLimit ?? 0) && (
                                            <p className="text-[10px] text-destructive mt-1 font-medium">Disbursement exceeds available limit.</p>
                                          )}
                                        </div>
                                        
                                        {!upFile.applicationId && (
                                          <div className="mt-2 text-xs flex items-center gap-2 text-destructive font-medium border border-destructive/20 bg-destructive/10 p-2 rounded-md">
                                            <AlertTriangle className="h-4 w-4" />
                                            <span>Dealer Not Found</span>
                                          </div>
                                        )}

                                        {upFile.overdueAmount && upFile.overdueAmount > 0 && (
                                          <div className="mt-2 text-xs flex items-center gap-2 text-destructive font-medium border border-destructive/20 bg-destructive/10 p-2 rounded-md">
                                            <AlertTriangle className="h-4 w-4" />
                                            <span>The Dealer is Overdue, kindly ask him to pay the Dues to Raise an Invoice</span>
                                          </div>
                                        )}
                                      </>
                                    )}
                                </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 shrink-0"
                              onClick={() => removeFile(index)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleInvoiceConstent} disabled={isSubmitting || uploadedFiles.some(f => f.isLoading)}>
              {isSubmitting || uploadedFiles.some(f => f.isLoading) ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Wand2 className="mr-2 h-4 w-4"/>}
              {isSubmitting ? 'Submitting...' : 'Submit Invoice'}
            </Button>
          </DialogFooter>
          <InvoiceConsentDialog
            open={consentOpen}
            document={uploadedFiles as InvoiceDocument[]}
            onClose={() => setConsentOpen(false)}
            onVerified={async () => {
              setConsentOpen(false);
              await handleSubmit();
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Standard Limit Exceeded Alert */}
      <AlertDialog open={limitErrorOpen} onOpenChange={setLimitErrorOpen}>
        <AlertDialogContent className="bg-background">
          <AlertDialogHeader>
            <AlertDialogTitle>Limit Exceeded</AlertDialogTitle>
            <AlertDialogDescription>
              Kindly note the Disbursement request is greater than the Available limit. Click to edit the value or request the borrower to pay the additional amount
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>Close</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Rule 1: PSBX NPA Blocking Alert */}
      <AlertDialog open={psbxNpaErrorOpen} onOpenChange={setPsbxNpaErrorOpen}>
        <AlertDialogContent className="bg-background border-destructive/50">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="w-5 h-5"/> Submission Blocked
            </AlertDialogTitle>
            <AlertDialogDescription className="text-foreground font-medium">
              Invoice can't be approved as customer is in NPA.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Close</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Rule 2: PSBX Limit Status Blocking Alert */}
      <AlertDialog open={psbxLimitStatusErrorOpen} onOpenChange={setPsbxLimitStatusErrorOpen}>
        <AlertDialogContent className="bg-background border-destructive/50">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="w-5 h-5"/> Submission Blocked
            </AlertDialogTitle>
            <AlertDialogDescription className="text-foreground font-medium">
              Invoice can't be approved as customer limit is not approved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Close</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Rule 3: PSBX Status Blocking Alert */}
      <AlertDialog open={psbxStatusErrorOpen} onOpenChange={setPsbxStatusErrorOpen}>
        <AlertDialogContent className="bg-background border-destructive/50">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="w-5 h-5"/> Submission Blocked
            </AlertDialogTitle>
            <AlertDialogDescription className="text-foreground font-medium">
              PSBX LMS Status is not Active
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Close</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
