
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
import { Button } from "@/components/ui/button";
import { UploadCloud, File as FileIcon, X, Loader2, Wand2, IndianRupee, Phone, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { extractInvoiceData, type ExtractInvoiceDataOutput } from "@/ai/flows/extract-invoice-data-flow";
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import type { Repayment } from "@/types";

type AddRepaymentDialogProps = {
  children: React.ReactNode;
  onAddRepayment: (repayment: Omit<Repayment, 'id' | 'status' | 'link' | 'amountRepaid'>) => void;
};

type UploadedFile = {
  file: File;
  extractedData?: ExtractInvoiceDataOutput;
  isLoading: boolean;
  error?: string;
};

export default function AddRepaymentDialog({ children, onAddRepayment }: AddRepaymentDialogProps) {
  const [open, setOpen] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
      invoiceAmount: "",
      dueDate: "",
      contactNumber: "",
  });
  const { toast } = useToast();
  
  const resetState = () => {
    setUploadedFile(null);
    setIsDragging(false);
    setIsSubmitting(false);
    setFormData({ invoiceAmount: "", dueDate: "", contactNumber: "" });
  };

  useEffect(() => {
    if (open) {
      resetState();
    }
  }, [open]);

  useEffect(() => {
    if (uploadedFile?.extractedData) {
        setFormData(prev => ({
            ...prev,
            invoiceAmount: uploadedFile.extractedData?.amount?.toString() || "",
            dueDate: uploadedFile.extractedData?.dueDate || ""
        }));
    }
  }, [uploadedFile]);

  const fileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleAIExtraction = async (file: File) => {
    try {
      const documentDataUri = await fileToDataUri(file);
      const result = await extractInvoiceData({ documentDataUri });
      setUploadedFile(prev => prev ? { ...prev, extractedData: result, isLoading: false } : null);
    } catch (error) {
      console.error("AI Extraction Error:", error);
      setUploadedFile(prev => prev ? { ...prev, isLoading: false, error: "AI failed to read this file." } : null);
    }
  };

  const handleFileChange = (newFiles: FileList | null) => {
    if (newFiles && newFiles.length > 0) {
      const file = newFiles[0];
      const newUpload: UploadedFile = {
        file,
        isLoading: true,
      };
      setUploadedFile(newUpload);
      handleAIExtraction(file);
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { id, value } = e.target;
      setFormData(prev => ({ ...prev, [id]: value }));
  };


  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!uploadedFile) setIsDragging(true);
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
    if (!uploadedFile && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files);
      e.dataTransfer.clearData();
    }
  };

  const handleSubmit = async () => {
    if (!uploadedFile || uploadedFile.isLoading || !uploadedFile.extractedData) {
      toast({ variant: "destructive", title: "Cannot Submit", description: "Please upload and process an invoice first." });
      return;
    }

    if (!formData.invoiceAmount || !formData.dueDate || !formData.contactNumber) {
       toast({ variant: "destructive", title: "Missing Information", description: "Please fill out all fields." });
      return;
    }

    setIsSubmitting(true);
    
    try {
        onAddRepayment({
            invoiceId: uploadedFile.extractedData.dealerName, // Using dealer name as a proxy for Invoice ID
            invoiceAmount: Number(formData.invoiceAmount),
            dueDate: formData.dueDate,
            contactNumber: formData.contactNumber,
        });

        toast({
            title: "Repayment Link Sent!",
            description: `The repayment link for invoice has been sent.`,
        });
        setOpen(false);
    } catch (error) {
       toast({
          variant: "destructive",
          title: "An unexpected error occurred.",
          description: "Could not add repayment. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Repayment</DialogTitle>
          <DialogDescription>
            Upload an invoice to extract details and send a repayment link.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          {!uploadedFile ? (
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
                accept="image/jpeg,image/png,application/pdf"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={(e) => handleFileChange(e.target.files)}
              />
              <div className="flex flex-col items-center justify-center space-y-2 text-muted-foreground">
                <UploadCloud className="w-10 h-10" />
                <p className="font-medium">
                  {isDragging ? "Drop file here" : "Drag & drop or click to upload"}
                </p>
                <p className="text-xs">Upload a single invoice file.</p>
              </div>
            </div>
          ) : (
             <Card>
                <CardContent className="p-3">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <FileIcon className="w-5 h-5 mt-1 shrink-0 text-muted-foreground" />
                            <div className="text-sm">
                                <p className="font-semibold truncate max-w-48" title={uploadedFile.file.name}>{uploadedFile.file.name}</p>
                                {uploadedFile.isLoading && (
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                        <Loader2 className="w-3 h-3 animate-spin"/>
                                        <span>AI is reading...</span>
                                    </div>
                                )}
                                {uploadedFile.error && <p className="text-xs text-destructive mt-1">{uploadedFile.error}</p>}
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 shrink-0"
                            onClick={() => setUploadedFile(null)}
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                </CardContent>
             </Card>
          )}

          {uploadedFile && !uploadedFile.isLoading && uploadedFile.extractedData && (
            <div className="space-y-4">
                <div className="text-center bg-secondary p-2 rounded-md">
                    <p className="text-sm text-muted-foreground">Invoice For</p>
                    <p className="font-semibold text-lg">{uploadedFile.extractedData.dealerName}</p>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="invoiceAmount">Invoice Amount</Label>
                    <div className="relative">
                        <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                        <Input id="invoiceAmount" value={formData.invoiceAmount} onChange={handleFormChange} className="pl-9" />
                    </div>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="dueDate">Due Date</Label>
                     <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                        <Input id="dueDate" value={formData.dueDate} onChange={handleFormChange} className="pl-9" />
                    </div>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="contactNumber">Contact Number</Label>
                     <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                        <Input id="contactNumber" value={formData.contactNumber} onChange={handleFormChange} placeholder="Enter 10-digit number" className="pl-9" />
                    </div>
                </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !uploadedFile?.extractedData}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Wand2 className="mr-2 h-4 w-4"/>}
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
