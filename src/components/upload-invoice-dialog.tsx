
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
import { UploadCloud, File as FileIcon, X, Loader2, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { extractInvoiceData, type ExtractInvoiceDataOutput } from "@/ai/flows/extract-invoice-data-flow";
import { Card, CardContent } from "./ui/card";
import { sendInvoiceEmail } from "@/app/add-invoice/email-actions";

type UploadInvoiceDialogProps = {
  children: React.ReactNode;
  defaultLender?: string;
};

type UploadedFile = {
  file: File;
  preview: string;
  extractedData?: ExtractInvoiceDataOutput;
  isLoading: boolean;
  error?: string;
};

export default function UploadInvoiceDialog({ children }: UploadInvoiceDialogProps) {
  const [open, setOpen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
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

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleAIExtraction = async (file: File, index: number) => {
    try {
      const documentDataUri = await fileToBase64(file);
      const result = await extractInvoiceData({ documentDataUri });
      
      setUploadedFiles(prev => prev.map((f, i) => 
        i === index ? { ...f, extractedData: result, isLoading: false } : f
      ));

    } catch (error) {
      console.error("AI Extraction Error:", error);
      setUploadedFiles(prev => prev.map((f, i) => 
        i === index ? { ...f, isLoading: false, error: "AI failed to read this file." } : f
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
      
      setUploadedFiles(prev => [...prev, ...addedFiles]);

      addedFiles.forEach((newFile, i) => {
        handleAIExtraction(newFile.file, uploadedFiles.length + i);
      });
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
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

  const handleSubmit = async () => {
    if (uploadedFiles.length === 0) {
      toast({ variant: "destructive", title: "No Files Uploaded", description: "Please upload at least one invoice document." });
      return;
    }

    if (uploadedFiles.some(f => f.isLoading)) {
      toast({ variant: "destructive", title: "Processing Files", description: "Please wait for the AI to finish reading all documents." });
      return;
    }

    setIsSubmitting(true);

    const emailData = uploadedFiles.map(upFile => ({
        fileName: upFile.file.name,
        extractedData: upFile.extractedData,
        error: upFile.error,
    }));

    const result = await sendInvoiceEmail(emailData);

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
    
    setIsSubmitting(false);
  };

  const formatCurrency = (amount?: number) => {
    if (typeof amount !== 'number') return "N/A";
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Raise Invoice with AI</DialogTitle>
          <DialogDescription>
            Upload invoice documents. The AI will automatically extract the details for you to review.
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
                {uploadedFiles.map((upFile, index) => (
                  <Card key={index}>
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between">
                         <div className="flex items-start gap-3">
                            <FileIcon className="w-5 h-5 mt-1 shrink-0 text-muted-foreground" />
                            <div className="text-sm">
                                <p className="font-semibold truncate max-w-48" title={upFile.file.name}>{upFile.file.name}</p>
                                {upFile.isLoading ? (
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                        <Loader2 className="w-3 h-3 animate-spin"/>
                                        <span>AI is reading...</span>
                                    </div>
                                ) : upFile.error ? (
                                    <p className="text-xs text-destructive mt-1">{upFile.error}</p>
                                ) : (
                                    <div className="grid grid-cols-2 gap-x-4 text-xs text-muted-foreground mt-2">
                                        <p><span className="font-medium text-foreground">Dealer:</span> {upFile.extractedData?.dealerName || 'N/A'}</p>
                                        <p><span className="font-medium text-foreground">Amount:</span> {formatCurrency(upFile.extractedData?.amount)}</p>
                                        <p><span className="font-medium text-foreground">Type:</span> {upFile.extractedData?.documentType || 'N/A'}</p>
                                        <p><span className="font-medium text-foreground">Due Date:</span> {upFile.extractedData?.dueDate || 'N/A'}</p>
                                    </div>
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
                ))}
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || uploadedFiles.some(f => f.isLoading)}>
            {isSubmitting || uploadedFiles.some(f => f.isLoading) ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Wand2 className="mr-2 h-4 w-4"/>}
            {isSubmitting ? 'Submitting...' : 'Submit Invoice'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
