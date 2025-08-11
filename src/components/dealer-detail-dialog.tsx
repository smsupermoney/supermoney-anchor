
"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import StatusBadge from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Archive, Ban, Loader2, Edit, Save, X, IndianRupee } from "lucide-react";
import type { Dealer } from "@/types";
import { stopSupplyAction } from "@/app/dashboard/stop-supply-action";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { updateDealerLimit } from "@/app/retailers/actions";

type DealerDetailDialogProps = {
  dealer: Dealer;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function DealerDetailDialog({ dealer, open, onOpenChange }: DealerDetailDialogProps) {
  const [currentDealer, setCurrentDealer] = useState(dealer);
  const [isStoppingSupply, setIsStoppingSupply] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newLimit, setNewLimit] = useState(dealer.totalLimit.toString());
  const [isSaving, setIsSaving] = useState(false);
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
  
  const handleSaveLimit = async () => {
      setIsSaving(true);
      const limitAsNumber = Number(newLimit);
      if (isNaN(limitAsNumber) || limitAsNumber < 0) {
          toast({ variant: 'destructive', title: 'Invalid Limit', description: 'Please enter a valid number.' });
          setIsSaving(false);
          return;
      }
      
      const result = await updateDealerLimit(currentDealer.id, limitAsNumber);
       if (result.error) {
            toast({ variant: 'destructive', title: 'Update Failed', description: result.error });
        } else {
            toast({ title: 'Success', description: result.message });
            setCurrentDealer(prev => ({ ...prev, totalLimit: limitAsNumber, availableLimit: limitAsNumber - prev.amountDisbursed }));
            setIsEditing(false);
        }
        setIsSaving(false);
  };


  // When the dialog is opened, reset the local state to the passed-in prop
  useEffect(() => {
    if (open) {
      setCurrentDealer(dealer);
      setNewLimit(dealer.totalLimit.toString());
      setIsEditing(false);
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
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-base">Financial Summary</CardTitle>
                    {!isEditing && (
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsEditing(true)}>
                            <Edit className="h-4 w-4" />
                        </Button>
                    )}
                </CardHeader>
                <CardContent>
                     <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
                        <div className="flex justify-between items-baseline">
                            <span className="text-muted-foreground">Total Limit</span>
                            {isEditing ? (
                                <div className="relative">
                                    <IndianRupee className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                                    <Input 
                                        type="number" 
                                        value={newLimit} 
                                        onChange={(e) => setNewLimit(e.target.value)} 
                                        className="h-8 pl-6" 
                                    />
                                </div>
                            ) : (
                                <span className="font-semibold">{formatCurrency(currentDealer.totalLimit)}</span>
                            )}
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
                            <span className="text-muted-foreground">Available Limit</span>
                            <span className="font-semibold text-green-600">{formatCurrency(currentDealer.availableLimit)}</span>
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
            <div className="flex justify-between w-full">
                {currentDealer.overdueAmount > 0 ? (
                    currentDealer.status === 'Supply Stopped' ? (
                        <Badge variant="destructive" className="mr-auto">Supply has been stopped</Badge>
                    ) : (
                        <Button variant="destructive" onClick={handleStopSupply} disabled={isStoppingSupply}>
                            {isStoppingSupply ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Ban className="mr-2 h-4 w-4" />}
                            Stop Supply
                        </Button>
                    )
                ) : <div></div>}
                 <div className="flex gap-2">
                    {isEditing && (
                        <>
                           <Button variant="ghost" onClick={() => setIsEditing(false)} disabled={isSaving}>
                                <X className="mr-2 h-4 w-4" /> Cancel
                           </Button>
                           <Button onClick={handleSaveLimit} disabled={isSaving}>
                                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                Save Changes
                           </Button>
                        </>
                    )}
                    {!isEditing && <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>}
                </div>
            </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
