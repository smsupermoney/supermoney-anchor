
"use client";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import type { Dealer } from "@/types";
import { AlertTriangle, Ban } from "lucide-react";

type OverdueNoticeDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  overdueDealers: Dealer[];
};

export default function OverdueNoticeDialog({
  open,
  onOpenChange,
  overdueDealers,
}: OverdueNoticeDialogProps) {
  const { toast } = useToast();

  const handleStopSupply = (dealerName: string) => {
    toast({
      title: "Action Required",
      description: `Please initiate the 'Stop Supply' process for ${dealerName} offline.`,
    });
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-destructive" />
            Overdue Payment Alert
          </AlertDialogTitle>
          <AlertDialogDescription>
            The following dealers have overdue payments. Please take the necessary action.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="max-h-[60vh] overflow-y-auto space-y-3 pr-2">
          {overdueDealers.map((dealer) => (
            <Card key={dealer.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold">{dealer.name}</p>
                  <p className="text-sm text-destructive">
                    Overdue: {formatCurrency(dealer.overdueAmount)}
                  </p>
                </div>
                <Button
                  variant="destructive"
                  onClick={() => handleStopSupply(dealer.name)}
                >
                  <Ban className="mr-2 h-4 w-4" />
                  Stop Supply
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        <AlertDialogFooter>
          <Button onClick={() => onOpenChange(false)}>Acknowledge</Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
