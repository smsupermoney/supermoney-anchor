"use client";

import { useState } from "react";
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
import { UploadCloud, File as FileIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { dealers } from "@/lib/data";

type UploadInvoiceDialogProps = {
  children: React.ReactNode;
};

export default function UploadInvoiceDialog({ children }: UploadInvoiceDialogProps) {
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedDealer, setSelectedDealer] = useState("");
  const { toast } = useToast();

  const handleFileChange = (newFiles: FileList | null) => {
    if (newFiles) {
      const addedFiles = Array.from(newFiles);
      if (files.length + addedFiles.length > 2) {
        toast({
          variant: "destructive",
          title: "Upload Limit Exceeded",
          description: "You can only upload a maximum of 2 documents.",
        });
        return;
      }
      setFiles((prevFiles) => [...prevFiles, ...addedFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
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
    if (!selectedDealer) {
      toast({
        variant: "destructive",
        title: "Dealer Not Selected",
        description: "Please select a dealer.",
      });
      return;
    }
    if (files.length === 0) {
      toast({
        variant: "destructive",
        title: "No Files Uploaded",
        description: "Please upload at least one invoice document.",
      });
      return;
    }
    // Handle submission logic here
    console.log("Submitting files for dealer:", selectedDealer, files);
    toast({
      title: "Invoice Submitted",
      description: `${files.length} document(s) for ${selectedDealer} have been submitted for processing.`,
    });
    setFiles([]);
    setSelectedDealer("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload Invoice</DialogTitle>
          <DialogDescription>
            Select a dealer and upload the invoice document and E-Way Bill.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="dealer-select">Choose Dealer</Label>
            <Select value={selectedDealer} onValueChange={setSelectedDealer}>
              <SelectTrigger id="dealer-select">
                <SelectValue placeholder="Select a dealer..." />
              </SelectTrigger>
              <SelectContent>
                {dealers.map((dealer) => (
                  <SelectItem key={dealer.id} value={dealer.name}>
                    {dealer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={cn(
              "relative border-2 border-dashed border-muted-foreground/30 rounded-lg p-8 text-center transition-colors duration-200",
              isDragging ? "bg-accent" : "bg-transparent"
            )}
          >
            <input
              type="file"
              multiple
              accept="image/*,.pdf"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={(e) => handleFileChange(e.target.files)}
              disabled={files.length >= 2}
            />
            <div className="flex flex-col items-center justify-center space-y-2 text-muted-foreground">
              <UploadCloud className="w-12 h-12" />
              <p className="font-medium">
                {isDragging ? "Drop files here" : "Drag & drop or click to upload"}
              </p>
              <p className="text-xs">PDF, PNG, JPG accepted</p>
            </div>
          </div>

          {files.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Uploaded Files:</h4>
              <ul className="space-y-2">
                {files.map((file, index) => (
                  <li
                    key={index}
                    className="flex items-center justify-between p-2 bg-secondary rounded-md text-sm"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <FileIcon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{file.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => removeFile(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Submit Invoice</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
