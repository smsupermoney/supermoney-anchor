
"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import StatusBadge from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Archive, Ban, Loader2 } from "lucide-react";
import type { Dealer } from "@/types";
import { stopSupplyAction } from "@/app/dashboard/stop-supply-action";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "./ui/badge";

type DealerDetailDialogProps = {
  dealer: Dealer;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function DealerDetailDialog({ dealer, open, onOpenChange }: DealerDetailDialogProps) {
  const [currentDealer, setCurrentDealer] = useState(dealer);
  const [isStoppingSupply, setIsStoppingSupply] = useState(false);
  const { toast } = useToast();
  
  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

  const handleStopSupply = async () => {
    setIsStoppingSupply(true);
    const result = await stopSupplyAction(currentDealer);
     if (result.error) {
      toast({
        variant: "destructive",
        title: "Action Failed",
        description: result.error,
      });
    } else {
      toast({
        title: "Action Successful",
        description: result.message,
      });
      // Update local state to reflect the change immediately
      setCurrentDealer(prev => ({...prev, status: 'Supply Stopped'}));
    }
    setIsStoppingSupply(false);
  }

  // When the dialog is opened, reset the local state to the passed-in prop
  React.useEffect(() => {
    if (open) {
      setCurrentDealer(dealer);
    }
  }, [open, dealer]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center pr-10">
            <span>{currentDealer.name}</span>
            <StatusBadge status={currentDealer.status} />
          </DialogTitle>
          <DialogDescription>
            <span className="font-semibold">Dealer ID:</span> {currentDealer.id}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Financial Summary</CardTitle>
                </CardHeader>
                <CardContent>
                     <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
                        <div className="flex justify-between items-baseline">
                            <span className="text-muted-foreground">Total Limit</span>
                            <span className="font-semibold">{formatCurrency(currentDealer.totalLimit)}</span>
                        </div>
                         <div className="flex justify-between items-baseline">
                            <span className="text-muted-foreground">Amount Disbursed</span>
                            <span className="font-semibold">{formatCurrency(currentDealer.amountDisbursed)}</span>
                        </div>
                         <div className="flex justify-between items-baseline">
                            <span className="text-muted-foreground">Overdue Amount</span>
                            <span className="font-semibold text-destructive">{formatCurrency(currentDealer.overdueAmount)}</span>
                        </div>
                        <div className="flex justify-between items-baseline">
                            <span className="text-muted-foreground">Associated Lender</span>
                            <span className="font-semibold text-right">{currentDealer.lenderName}</span>
                        </div>
                     </div>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle className="text-base">Activity Summary</CardTitle>
                </CardHeader>
                <CardContent>
                     <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
                        <div className="flex justify-between items-baseline">
                            <span className="text-muted-foreground">Invoices Submitted</span>
                            <span className="font-semibold">{currentDealer.invoicesSubmitted}</span>
                        </div>
                        <div className="flex justify-between items-baseline">
                            <span className="text-muted-foreground">Overdue Invoices</span>
                            <span className="font-semibold text-destructive">{currentDealer.overdueCount}</span>
                        </div>
                     </div>
                </CardContent>
            </Card>
        </div>
        <DialogFooter>
            {currentDealer.overdueAmount > 0 && (
                currentDealer.status === 'Supply Stopped' ? (
                    <Badge variant="destructive" className="mr-auto">Supply has been stopped</Badge>
                ) : (
                    <Button variant="destructive" onClick={handleStopSupply} disabled={isStoppingSupply}>
                        {isStoppingSupply ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Ban className="mr-2 h-4 w-4" />}
                        Stop Supply
                    </Button>
                )
            )}
            <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
