
"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UploadCloud, FileText, Bot, Loader2, AlertCircle } from "lucide-react";
import type { OnboardingPartner, OnboardingStatus } from "@/types";
import type { DocumentProcessOutput } from "@/ai/flows/document-processing";
import { processDocumentsOnServer } from "../actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type DocumentManagerProps = {
  partner: OnboardingPartner;
  onUpdateStatus: (status: OnboardingStatus) => void;
  isValidator?: boolean;
};

export default function DocumentManager({ partner, onUpdateStatus, isValidator = false }: DocumentManagerProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedDocs, setProcessedDocs] = useState<DocumentProcessOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsProcessing(true);
    setError(null);
    setProcessedDocs(null);

    try {
      const fileReaders = Array.from(files).map(file => {
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      });

      const dataUris = await Promise.all(fileReaders);
      const result = await processDocumentsOnServer(dataUris);

      setProcessedDocs(result);
    } catch (e) {
      console.error(e);
      setError("An error occurred while processing the documents. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // The validator view can be built out later if needed. For now, it shows a placeholder.
  if (isValidator) {
      return (
          <Card>
              <CardHeader>
                  <CardTitle>Document Validation</CardTitle>
                  <CardDescription>Review the submitted documents for clarity and correctness.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                  <div className="h-40 bg-secondary rounded-md flex items-center justify-center">
                    <p className="text-muted-foreground text-sm">AI-processed document view coming soon.</p>
                  </div>
              </CardContent>
          </Card>
      )
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Document Collection</CardTitle>
        <CardDescription>
          {partner.status === 'Awaiting Resubmission'
            ? 'Some documents require re-submission. Please upload all required documents again.'
            : 'Upload all mandatory documents to proceed with validation.'
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          multiple
          accept="image/png, image/jpeg, image/webp"
        />
        
        {!processedDocs && !isProcessing && (
          <div
            className="flex flex-col items-center justify-center w-full p-8 border-2 border-dashed rounded-lg cursor-pointer hover:bg-secondary transition-colors"
            onClick={handleUploadClick}
          >
            <UploadCloud className="w-12 h-12 text-muted-foreground" />
            <p className="mt-4 font-semibold">Click to upload or drag & drop</p>
            <p className="text-xs text-muted-foreground">PAN, GST, Canceled Cheque, etc.</p>
          </div>
        )}

        {isProcessing && (
            <div className="flex flex-col items-center justify-center w-full p-8 text-center">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                <p className="mt-4 font-semibold text-primary">AI is processing documents...</p>
                <p className="text-xs text-muted-foreground">This may take a moment.</p>
            </div>
        )}

        {error && (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Processing Failed</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}

        {processedDocs && (
          <div className="space-y-4">
            <CardHeader className="p-0">
              <CardTitle className="flex items-center gap-2 text-base"><Bot className="w-5 h-5 text-primary" /> AI Analysis Complete</CardTitle>
              <CardDescription>Review the extracted details below. If correct, submit for validation. To make corrections, please re-upload.</CardDescription>
            </CardHeader>
            <div className="grid sm:grid-cols-2 gap-4">
              {processedDocs.map((doc, index) => (
                <Card key={index} className="bg-secondary/50">
                  <CardHeader className="p-3">
                    <CardTitle className="flex items-center gap-2 text-sm">
                        <FileText className="w-4 h-4 text-primary" />
                        {doc.documentType}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 pt-0 space-y-2 text-xs">
                    {Object.entries(doc.details).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                            <span className="text-muted-foreground">{key}:</span>
                            <span className="font-medium text-right">{value}</span>
                        </div>
                    ))}
                    {Object.keys(doc.details).length === 0 && (
                        <p className="text-muted-foreground italic">No details extracted.</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between items-center border-t pt-4">
        <Button variant="outline" onClick={handleUploadClick} disabled={isProcessing}>
            {processedDocs ? "Re-upload" : "Upload Documents"}
        </Button>
        <Button size="lg" disabled={!processedDocs || isProcessing} onClick={() => onUpdateStatus('Pending RM Document Validation')}>
          Submit for Validation
        </Button>
      </CardFooter>
    </Card>
  );
}
