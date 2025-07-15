
"use client";

import * as React from "react";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Upload } from "lucide-react";

type UploadExcelFormProps = {
    action: (formData: FormData) => Promise<{ message?: string; error?: string }>;
};

export default function UploadExcelForm({ action }: UploadExcelFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();
    const formRef = useRef<HTMLFormElement>(null);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const file = formData.get('excel-file') as File;

        if (!file || file.size === 0) {
            setError("Please select an Excel file to upload.");
            return;
        }
        
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
                <Input
                    id="excel-file"
                    name="excel-file"
                    type="file"
                    accept=".xlsx, .xls"
                    disabled={isSubmitting}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                />
            </div>
             {error && (
                <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Upload Failed</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
            <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting}>
                    <Upload className="mr-2 h-4 w-4" />
                    {isSubmitting ? "Uploading..." : "Upload and Add"}
                </Button>
            </div>
        </form>
    );
}
