"use client";

import * as React from "react";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Upload, File as FileIcon, X } from "lucide-react";

type UploadExcelFormProps = {
    action: (formData: FormData) => Promise<{ message?: string; error?: string }>;
    onSuccess?: () => void;
    buttonText?: string;
};

export default function UploadExcelForm({ action, onSuccess, buttonText = "Upload and Add" }: UploadExcelFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const { toast } = useToast();

    // Temp: prevent 413 errors from nginx (default 1MB body limit).
    // TODO: proper fix — upload via API route or increase nginx client_max_body_size.
    const MAX_FILE_SIZE_MB = 5;
    const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

    const formRef = useRef<HTMLFormElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.size > MAX_FILE_SIZE_BYTES) {
                setError(`File "${file.name}" is ${(file.size / 1024 / 1024).toFixed(1)}MB — exceeds the ${MAX_FILE_SIZE_MB}MB limit. Please upload a smaller file.`);
                setSelectedFile(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
                return;
            }
            setSelectedFile(file);
            setError(null);
        }
    };
    
    const clearFile = () => {
        setSelectedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!selectedFile) {
            setError("Please select an Excel file to upload.");
            return;
        }
        
        const formData = new FormData(event.currentTarget);
        
        setError(null);
        setIsSubmitting(true);

        try {
            const result = await action(formData);
            if (result.error) {
                setError(result.error);
            } else {
                toast({
                    title: "Success!",
                    description: result.message,
                });
                formRef.current?.reset();
                clearFile();
                if (onSuccess) {
                    onSuccess();
                }
            }
        } catch (e) {
            setError("An unexpected error occurred. Please check the console for more details.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="excel-file">Excel File</Label>
                <div className="flex items-center gap-2">
                    <Input
                        id="excel-file"
                        name="excel-file"
                        type="file"
                        accept=".xlsx, .xls"
                        disabled={isSubmitting}
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="sr-only"
                    />
                    <Label 
                        htmlFor="excel-file" 
                        className="flex-shrink-0 cursor-pointer inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                    >
                        Choose File
                    </Label>
                    <div className="flex-grow p-2 border border-input rounded-md h-10 flex items-center bg-secondary/50">
                        {selectedFile ? (
                           <div className="flex items-center justify-between w-full">
                             <div className="flex items-center gap-2 truncate">
                                <FileIcon className="h-4 w-4 text-muted-foreground shrink-0"/>
                                <span className="text-sm text-foreground truncate">{selectedFile.name}</span>
                             </div>
                             <Button type="button" variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={clearFile}>
                                 <X className="h-4 w-4"/>
                             </Button>
                           </div>
                        ) : (
                            <span className="text-sm text-muted-foreground">No file chosen</span>
                        )}
                    </div>
                </div>
            </div>
             {error && (
                <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Upload Failed</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
            <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting || !selectedFile}>
                    <Upload className="mr-2 h-4 w-4" />
                    {isSubmitting ? "Uploading..." : buttonText}
                </Button>
            </div>
        </form>
    );
}
