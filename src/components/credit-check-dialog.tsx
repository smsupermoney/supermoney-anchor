
"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, ShieldCheck, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Button } from "./ui/button";

type CreditCheckDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreditCheckComplete: (score: number) => void;
};

export default function CreditCheckDialog({ open, onOpenChange, onCreditCheckComplete }: CreditCheckDialogProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [score, setScore] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      setIsLoading(true);
      setScore(null);

      const timer = setTimeout(() => {
        const generatedScore = Math.floor(Math.random() * 5) + 6; // Random score between 6 and 10
        setScore(generatedScore);
        setIsLoading(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [open]);

  const handleConfirm = () => {
    if (score !== null) {
      onCreditCheckComplete(score);
      toast({
        title: "Credit Check Complete",
        description: `The credit score has been updated to ${score}/10.`,
      });
      onOpenChange(false);
    }
  };

  const scoreColor = (s: number | null) => {
    if (s === null) return "text-muted-foreground";
    if (s < 5) return "text-red-500";
    if (s < 8) return "text-yellow-500";
    return "text-green-500";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
             <ShieldCheck className="h-5 w-5 text-primary" />
             Credit Score Analysis
          </DialogTitle>
          <DialogDescription>
            Our AI is performing a real-time credit analysis.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center h-48 my-4 bg-secondary rounded-lg border">
          {isLoading ? (
            <>
              <div className="relative">
                <Loader2 className="h-16 w-16 text-primary animate-spin" />
                <Sparkles className="h-8 w-8 text-yellow-400 absolute -top-2 -right-2 animate-pulse" />
              </div>
              <p className="mt-4 text-sm text-muted-foreground animate-pulse">Analyzing credit profile...</p>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">Credit Score</p>
              <p className={cn("text-7xl font-bold tracking-tighter", scoreColor(score))}>
                {score}
                <span className="text-2xl text-muted-foreground">/10</span>
              </p>
              <Button onClick={handleConfirm} className="mt-4">
                Confirm and Update Score
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
