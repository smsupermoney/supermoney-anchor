
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
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useToast } from "@/hooks/use-toast";
import { IndianRupee } from "lucide-react";

type ApproveLimitDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (limit: number) => void;
  requestedLimit?: number;
};

export default function ApproveLimitDialog({ open, onOpenChange, onSubmit, requestedLimit }: ApproveLimitDialogProps) {
  const [limit, setLimit] = useState("");
  const { toast } = useToast();

  const handleSubmit = () => {
    const numericLimit = Number(limit);
    if (isNaN(numericLimit) || numericLimit <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid Amount",
        description: "Please enter a valid positive number for the limit.",
      });
      return;
    }
    onSubmit(numericLimit);
    onOpenChange(false);
  };
  
  const formatCurrency = (amount?: number) => {
    if (typeof amount !== 'number') return "N/A";
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Approve Business Limit</DialogTitle>
          <DialogDescription>
            Enter the final approved credit limit for this dealer.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
            {requestedLimit && (
                <div className="text-sm">
                    <span className="text-muted-foreground">Requested Limit: </span>
                    <span className="font-semibold">{formatCurrency(requestedLimit)}</span>
                </div>
            )}
            <div>
                <Label htmlFor="approved-limit">Approved Limit</Label>
                <div className="relative mt-1">
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        id="approved-limit"
                        type="number"
                        value={limit}
                        onChange={(e) => setLimit(e.target.value)}
                        placeholder="e.g., 500000"
                        className="pl-9"
                    />
                </div>
            </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Confirm & Approve
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
