
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UploadCloud, File as FileIcon, X, Loader2, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "./ui/textarea";

type SiteVisitDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { notes: string; images: File[] }) => void;
};

type UploadedFile = {
  file: File;
  preview: string;
};

export default function SiteVisitDialog({ open, onOpenChange, onSubmit }: SiteVisitDialogProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [notes, setNotes] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (newFiles: FileList | null) => {
    if (newFiles) {
      const addedFiles = Array.from(newFiles).map(file => ({
        file,
        preview: URL.createObjectURL(file),
      }));
      setUploadedFiles(prev => [...prev, ...addedFiles]);
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

  const handleSubmit = () => {
    if (!notes.trim()) {
      toast({ variant: "destructive", title: "Notes Required", description: "Please add some notes for the site visit report." });
      return;
    }
     if (uploadedFiles.length === 0) {
      toast({ variant: "destructive", title: "Images Required", description: "Please upload at least one image for the report." });
      return;
    }

    setIsSubmitting(true);
    // Simulate submission delay
    setTimeout(() => {
        onSubmit({ notes, images: uploadedFiles.map(f => f.file) });
        toast({ title: "Report Submitted", description: "The site visit report has been successfully submitted." });
        setIsSubmitting(false);
    }, 1000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Submit Site Visit Report</DialogTitle>
          <DialogDescription>
            Add your notes and upload images from the site visit.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div>
            <label htmlFor="notes" className="text-sm font-medium mb-2 block">Visit Notes</label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter your observations..."
              rows={4}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Upload Images</label>
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
                accept="image/jpeg,image/png"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={(e) => handleFileChange(e.target.files)}
              />
              <div className="flex flex-col items-center justify-center space-y-2 text-muted-foreground">
                <UploadCloud className="w-10 h-10" />
                <p className="font-medium">
                  {isDragging ? "Drop images here" : "Drag & drop or click to upload"}
                </p>
                <p className="text-xs">PNG, or JPG files accepted.</p>
              </div>
            </div>
          </div>

          {uploadedFiles.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Uploaded Images:</h4>
              <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-2">
                {uploadedFiles.map((upFile, index) => (
                    <div key={index} className="relative group">
                        <img src={upFile.preview} alt={`preview ${index}`} className="w-full h-24 object-cover rounded-md" />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeFile(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                    </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Send className="mr-2 h-4 w-4"/>}
            {isSubmitting ? 'Submitting...' : 'Submit Report'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
