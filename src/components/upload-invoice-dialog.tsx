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
import { UploadCloud, File as FileIcon, X, Loader2, Wand2, IndianRupee, AlertTriangle, ShieldCheck, Building2, User, Landmark } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { sendInvoiceEmail } from "@/app/add-invoice/email-actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Dealer, Program, PsbxLimitData } from "@/types";
import { InvoiceConsentDialog } from "./invoice-consent-dialog";
import { extractInvoiceData, type ExtractInvoiceDataOutput } from "@/ai/flows/extract-invoice-data-flow";
import { fetchPsbxLimit, fetchPsbxTransactionDetail } from "@/app/retailers/psbx-actions";
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
  extractedData?: ExtractInvoiceDataOutput;
  resolvedAnchorName?: string;
  resolvedDealerName?: string;
  resolvedDealerGstin?: string;
  disburseAmount?: string;
  selectedAnchorAcc?: string;
  anchorAccounts?: { anchorAcc: string }[];
  isLoading: boolean;
  error?: string;
  overdueAmount?: number;
  availableLimit?: number;
  applicationId?: string;
  customerId?: string;
  psbxData?: PsbxLimitData;
  programId?: string;
  matchingDealers?: Dealer[];
};

export default function UploadInvoiceDialog({ children, dealers }: UploadInvoiceDialogProps) {
  const [open, setOpen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [consentOpen, setConsentOpen] = useState(false);
  const [limitErrorOpen, setLimitErrorOpen] = useState(false);
  
  const [psbxNpaErrorOpen, setPsbxNpaErrorOpen] = useState(false);
  const [psbxLimitStatusErrorOpen, setPsbxLimitStatusErrorOpen] = useState(false);
  const [psbxStatusErrorOpen, setPsbxStatusErrorOpen] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConsentRequired, setIsConsentRequired] = useState(false);
  const { toast } = useToast();

  const MAX_FILE_SIZE_MB = 5;
  const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

  const resetState = () => {
    setUploadedFiles([]);
    setIsDragging(false);
    setIsSubmitting(false);
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

  const checkAndFetchPsbx = async (index: number, dealer: Dealer) => {
    if (!dealer.programId || !dealer.applicationId) return;

    try {
      const programDoc = await getDoc(doc(db1, "programs", dealer.programId));
      const programData = programDoc.data() as any;

      const isPsbxProgram = programData?.SmartdashLender?.startsWith('PSBX') || dealer.programId === 'PROG011';

      if (isPsbxProgram) {
        setUploadedFiles(prev => prev.map((f, i) => i === index ? { ...f, isLoading: true } : f));
        
        // Fetch Limit
        const psbxResult = await fetchPsbxLimit(dealer.applicationId);
        
        // Specific for PROG011: Fetch anchor accounts
        let anchorAccounts = [];
        if (dealer.programId === 'PROG011') {
            const detailResult = await fetchPsbxTransactionDetail(dealer.applicationId);
            if (detailResult.data?.lmsmappinganchoraccountno) {
                anchorAccounts = detailResult.data.lmsmappinganchoraccountno;
            }
        }

        setUploadedFiles(prev => prev.map((f, i) => 
          i === index ? { 
              ...f, 
              psbxData: psbxResult.data,
              anchorAccounts: anchorAccounts,
              isLoading: false,
              error: psbxResult.error ? `PSBX Error: ${psbxResult.error}` : f.error
          } : f
        ));
      } else {
        setUploadedFiles(prev => prev.map((f, i) => i === index ? { ...f, isLoading: false } : f));
      }
    } catch (e) {
      console.error("Error checking program for PSBX:", e);
      setUploadedFiles(prev => prev.map((f, i) => i === index ? { ...f, isLoading: false } : f));
    }
  };

  const handleDealerSelection = async (index: number, dealerId: string) => {
    const dealer = dealers.find(d => d.id === dealerId);
    if (!dealer) return;

    setUploadedFiles(prev => prev.map((f, i) => 
      i === index ? { 
          ...f, 
          applicationId: dealer.applicationId,
          customerId: dealer.customerId,
          availableLimit: dealer.availableLimit,
          overdueAmount: dealer.overdueAmount,
          programId: dealer.programId,
          psbxData: undefined,
          anchorAccounts: undefined
      } : f
    ));

    await checkAndFetchPsbx(index, dealer);
  };

  const handleAIExtraction = async (file: File, index: number) => {
    try {
      const documentDataUri = await fileToDataUri(file);
      const result = await extractInvoiceData({ documentDataUri });

      let dealerCandidateName = "";
      let dealerCandidateGstin = "";
      let anchorCandidateName = "";

      if (result.documentType === 'PURCHASE_ORDER') {
          dealerCandidateName = result.issuerName || result.buyerName || "";
          dealerCandidateGstin = result.issuerGstin || result.buyerGstin || "";
          anchorCandidateName = result.toPartyName || result.supplierName || "";
      } else {
          dealerCandidateName = result.buyerName || result.shipToName || "";
          dealerCandidateGstin = result.buyerGstin || "";
          anchorCandidateName = result.issuerName || result.supplierName || "";
      }

      let matchingDealers = dealers.filter(d => 
        (dealerCandidateGstin && d.GST === dealerCandidateGstin) ||
        (!dealerCandidateGstin && d.name.toLowerCase().trim() === dealerCandidateName.toLowerCase().trim())
      );

      setUploadedFiles(prev => prev.map((f, i) => 
        i === index ? { 
            ...f, 
            extractedData: result,
            resolvedAnchorName: anchorCandidateName,
            resolvedDealerName: dealerCandidateName,
            resolvedDealerGstin: dealerCandidateGstin,
            disburseAmount: (result.totalAmount || 0).toString(),
            matchingDealers: matchingDealers
        } : f
      ));

      if (matchingDealers.length === 1) {
          const dealer = matchingDealers[0];
          setUploadedFiles(prev => prev.map((f, i) => 
            i === index ? { 
                ...f, 
                applicationId: dealer.applicationId,
                customerId: dealer.customerId,
                availableLimit: dealer.availableLimit,
                overdueAmount: dealer.overdueAmount,
                programId: dealer.programId
            } : f
          ));
          await checkAndFetchPsbx(index, dealer);
      } else {
          setUploadedFiles(prev => prev.map((f, i) => i === index ? { ...f, isLoading: false } : f));
      }

    } catch (error: any) {
      console.error("Extraction Error:", error);
      setUploadedFiles(prev => prev.map((f, i) => 
        i === index ? { ...f, isLoading: false, error: error.message || "Failed to read document." } : f
      ));
    }
  };

  const handleFileChange = (newFiles: FileList | null) => {
    if (newFiles) {
      const fileArray = Array.from(newFiles);
      const oversized = fileArray.filter(f => f.size > MAX_FILE_SIZE_BYTES);
      if (oversized.length > 0) {
        const names = oversized.map(f => `"${f.name}" (${(f.size / 1024 / 1024).toFixed(1)}MB)`).join(", ");
        toast({
          variant: "destructive",
          title: "File too large",
          description: `${names} exceeds the ${MAX_FILE_SIZE_MB}MB limit.`,
        });
      }

      const validFiles = fileArray.filter(f => f.size <= MAX_FILE_SIZE_BYTES);
      if (validFiles.length === 0) return;

      const addedFiles = validFiles.map(file => ({
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

  const handleAnchorAccChange = (index: number, value: string) => {
    setUploadedFiles(prev => prev.map((f, i) => 
        i === index ? { ...f, selectedAnchorAcc: value } : f
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

  const handleSubmissionCheck = () => {
    if (uploadedFiles.length === 0) return;
    if (uploadedFiles.some(f => f.isLoading)) return;

    if (uploadedFiles.some(f => !f.applicationId)) {
        toast({ variant: "destructive", title: "Dealer Missing", description: "Please resolve the dealer for all documents." });
        return;
    }

    if (uploadedFiles.some(f => f.programId === 'PROG011' && !f.selectedAnchorAcc)) {
        toast({ variant: "destructive", title: "Account Missing", description: "Please select an Anchor Account for all documents." });
        return;
    }

    // PSBX Checks
    for (const file of uploadedFiles) {
        if (file.psbxData) {
            const { lmsnpastatus, lmslimitstatus, lmsstatus } = file.psbxData;
            if (lmsnpastatus && lmsnpastatus !== 'No') { setPsbxNpaErrorOpen(true); return; }
            if (lmslimitstatus && lmslimitstatus !== 'Approved') { setPsbxLimitStatusErrorOpen(true); return; }
            if (lmsstatus && lmsstatus !== 'Active') { setPsbxStatusErrorOpen(true); return; }
        }
    }

    const anyConsentRequired = uploadedFiles.some(f => {
        const dealer = dealers.find(d => d.applicationId === f.applicationId);
        return dealer?.anchorId === "ANC002" || dealer?.anchorId === "ANC008";
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
          extractedData: {
              invoiceNumber: upFile.extractedData?.invoiceNumber || upFile.extractedData?.poNumber || "N/A",
              dealerName: upFile.resolvedDealerName || "N/A",
              documentType: upFile.extractedData?.documentType || "N/A",
              amount: upFile.extractedData?.totalAmount || 0,
              dueDate: upFile.extractedData?.dueDate || upFile.extractedData?.documentDate || "N/A",
              utrNumber: "",
              gstOrGstin: upFile.resolvedDealerGstin || ""
          },
          disburseAmount: upFile.disburseAmount ? Number(upFile.disburseAmount) : undefined,
          selectedAnchorAcc: upFile.selectedAnchorAcc,
          error: upFile.error,
          fileContent: await fileToDataUri(upFile.file),
          applicationId: upFile.applicationId,
          customerId: upFile.customerId,
      }));
      
      const emailData = await Promise.all(emailDataPromises);
      const result = await sendInvoiceEmail(emailData, isConsentRequired);

      if (result.error) {
          toast({ variant: "destructive", title: "Failed", description: result.error });
      } else {
          toast({ title: "Submitted", description: "Submission initiated successfully." });
          setOpen(false);
      }
    } catch (error) {
       console.error("Submission error:", error);
       toast({ variant: "destructive", title: "Error", description: "Something went wrong." });
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
            <DialogTitle>Raise Invoice / PO with OCR</DialogTitle>
            <DialogDescription>
              Details are automatically resolved from your documents.
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
                <p className="font-medium">{isDragging ? "Drop files here" : "Drag & drop or click to upload"}</p>
                <p className="text-xs">Supports Invoice and Purchase Order documents.</p>
              </div>
            </div>

            {uploadedFiles.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Review Documents:</h4>
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                  {uploadedFiles.map((upFile, index) => {
                    const isPo = upFile.extractedData?.documentType === 'PURCHASE_ORDER';
                    const isPsbx = upFile.psbxData !== undefined;
                    const docNumber = isPo ? upFile.extractedData?.poNumber : upFile.extractedData?.invoiceNumber;
                    const amount = upFile.extractedData?.totalAmount || 0;
                    const advance = upFile.extractedData?.advanceAmount;

                    return (
                      <Card key={index} className={cn("bg-background border-l-4", isPo ? "border-l-blue-500" : "border-l-primary")}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4 flex-grow">
                                <FileIcon className="w-6 h-6 mt-1 shrink-0 text-muted-foreground" />
                                <div className="text-sm flex-grow space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Badge variant="secondary" className="text-[10px] uppercase font-bold">{upFile.extractedData?.documentType?.replace('_', ' ') || 'Document'}</Badge>
                                        <p className="font-bold text-base">{docNumber || 'No ID detected'}</p>
                                        {isPsbx && <Badge className="bg-primary/10 text-primary border-primary/20"><ShieldCheck className="w-3 h-3 mr-1"/> PSBX</Badge>}
                                    </div>
                                    
                                    {upFile.isLoading ? (
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground"><Loader2 className="w-3 h-3 animate-spin"/><span>Analyzing document roles...</span></div>
                                    ) : (
                                      <>
                                        <div className="grid grid-cols-2 gap-4 text-xs">
                                            <div className="space-y-1">
                                                <Label className="text-[10px] text-muted-foreground flex items-center gap-1"><Building2 className="w-3 h-3"/> Resolved Anchor</Label>
                                                <p className="font-medium truncate">{upFile.resolvedAnchorName || 'N/A'}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-[10px] text-muted-foreground flex items-center gap-1"><User className="w-3 h-3"/> Resolved Dealer</Label>
                                                <p className="font-medium truncate">{upFile.resolvedDealerName || 'N/A'}</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-3 gap-2 text-xs pt-1">
                                            <div className="bg-secondary/50 p-2 rounded">
                                                <p className="text-[9px] text-muted-foreground uppercase">{isPo ? 'PO Date' : 'Inv. Date'}</p>
                                                <p className="font-semibold">{upFile.extractedData?.documentDate || 'N/A'}</p>
                                            </div>
                                            <div className="bg-secondary/50 p-2 rounded">
                                                <p className="text-[9px] text-muted-foreground uppercase">Doc Amount</p>
                                                <p className="font-semibold">{formatCurrency(amount)}</p>
                                            </div>
                                            {advance !== undefined && (
                                                <div className="bg-blue-50 p-2 rounded border border-blue-100">
                                                    <p className="text-[9px] text-blue-600 uppercase">Advance/Retention</p>
                                                    <p className="font-semibold text-blue-700">{formatCurrency(advance)}</p>
                                                </div>
                                            )}
                                        </div>

                                        {upFile.matchingDealers && upFile.matchingDealers.length > 1 && !upFile.applicationId && (
                                            <div className="space-y-1.5 border-t pt-2">
                                                <Label className="text-[10px] font-bold text-primary">SELECT PROGRAM FOR DEALER</Label>
                                                <Select onValueChange={(val) => handleDealerSelection(index, val)}>
                                                    <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Multiple programs found - choose one" /></SelectTrigger>
                                                    <SelectContent>
                                                        {upFile.matchingDealers.map(d => <SelectItem key={d.id} value={d.id}>{d.lenderName} ({d.id})</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}

                                        {!upFile.applicationId && (!upFile.matchingDealers || upFile.matchingDealers.length === 0) && (
                                            <div className="space-y-2 border-t pt-2">
                                                <div className="flex items-center gap-2 text-destructive font-bold text-xs"><AlertTriangle className="w-4 h-4" /> <span>Dealer not matched in platform</span></div>
                                                <Select onValueChange={(val) => handleDealerSelection(index, val)}>
                                                    <SelectTrigger className="h-8 text-[10px]"><SelectValue placeholder="Manually map to existing dealer" /></SelectTrigger>
                                                    <SelectContent>{dealers.map(d => <SelectItem key={d.id} value={d.id}>{d.name} ({d.lenderName})</SelectItem>)}</SelectContent>
                                                </Select>
                                            </div>
                                        )}

                                        {upFile.applicationId && (
                                          <div className="space-y-3">
                                            {upFile.programId === 'PROG011' && upFile.anchorAccounts && (
                                                <div className="space-y-1.5 pt-1">
                                                    <Label className="text-[10px] font-bold text-primary flex items-center gap-1">
                                                        <Landmark className="w-3 h-3" /> SELECT ANCHOR ACCOUNT
                                                    </Label>
                                                    <Select onValueChange={(val) => handleAnchorAccChange(index, val)} value={upFile.selectedAnchorAcc}>
                                                        <SelectTrigger className="h-8 text-xs">
                                                            <SelectValue placeholder="Choose an account number" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {upFile.anchorAccounts.map(acc => (
                                                                <SelectItem key={acc.anchorAcc} value={acc.anchorAcc}>{acc.anchorAcc}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            )}

                                            <div className="bg-primary/5 p-3 rounded-md space-y-2">
                                                <div className="flex justify-between items-center text-[10px]">
                                                <Label className="font-bold text-primary">DISBURSEMENT REQUEST</Label>
                                                <span className="text-muted-foreground font-medium">Available: {formatCurrency(isPsbx ? upFile.psbxData?.availablelimit : upFile.availableLimit)}</span>
                                                </div>
                                                <div className="relative">
                                                    <IndianRupee className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-primary"/>
                                                    <Input 
                                                    type="number"
                                                    className="h-9 pl-7 font-bold"
                                                    value={upFile.disburseAmount}
                                                    onChange={(e) => handleDisburseAmountChange(index, e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                          </div>
                                        )}
                                      </>
                                    )}
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" className="h-8 w-8 -mt-2 -mr-2" onClick={() => removeFile(index)}><X className="w-4 h-4" /></Button>
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
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmissionCheck} disabled={isSubmitting || uploadedFiles.some(f => f.isLoading)}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Wand2 className="mr-2 h-4 w-4"/>}
              Submit for Financing
            </Button>
          </DialogFooter>
          <InvoiceConsentDialog
            open={consentOpen}
            document={uploadedFiles as any}
            onClose={() => setConsentOpen(false)}
            onVerified={async () => { setConsentOpen(false); await handleSubmit(); }}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={psbxNpaErrorOpen} onOpenChange={setPsbxNpaErrorOpen}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>NPA Block</AlertDialogTitle><AlertDialogDescription>Submission blocked as the customer is currently in NPA.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogAction>Close</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={psbxLimitStatusErrorOpen} onOpenChange={setPsbxLimitStatusErrorOpen}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Limit Not Approved</AlertDialogTitle><AlertDialogDescription>Submission blocked as the customer limit is not currently approved in PSBX.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogAction>Close</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={psbxStatusErrorOpen} onOpenChange={setPsbxStatusErrorOpen}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>LMS Inactive</AlertDialogTitle><AlertDialogDescription>Submission blocked as the PSBX LMS Status is not Active.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogAction>Close</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
      </AlertDialog>
    </>
  );
}
