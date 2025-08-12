
"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import StatusBadge from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Ban, Loader2, Edit, Save, X, IndianRupee } from "lucide-react";
import type { Dealer } from "@/types";
import { stopSupplyAction } from "@/app/dashboard/stop-supply-action";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { updateDealerDetails } from "@/app/retailers/actions";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Label } from "./ui/label";

type DealerDetailDialogProps = {
  dealer: Dealer;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const dealerStatuses: Dealer['status'][] = ["Active", "Inactive", "Pending", "Supply Stopped"];

export default function DealerDetailDialog({ dealer, open, onOpenChange }: DealerDetailDialogProps) {
  const [currentDealer, setCurrentDealer] = useState(dealer);
  const [isStoppingSupply, setIsStoppingSupply] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [editValues, setEditValues] = useState({
      totalLimit: dealer.totalLimit.toString(),
      amountDisbursed: dealer.amountDisbursed.toString(),
      overdueAmount: dealer.overdueAmount.toString(),
      status: dealer.status,
  });

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
      const newStatus = 'Supply Stopped';
      setCurrentDealer(prev => ({...prev, status: newStatus}));
      setEditValues(prev => ({...prev, status: newStatus}));
    }
    setIsStoppingSupply(false);
  }
  
  const handleSave = async () => {
      setIsSaving(true);

      const payload = {
        dealerId: currentDealer.id,
        totalLimit: Number(editValues.totalLimit),
        utilisationAmount: Number(editValues.amountDisbursed),
        principalOverdue: Number(editValues.overdueAmount),
        status: editValues.status as Dealer['status'],
      };
      
      const result = await updateDealerDetails(payload);

      if (result.error) {
            toast({ variant: 'destructive', title: 'Update Failed', description: result.error });
        } else {
            toast({ title: 'Success', description: result.message });
            // Update local state with the new values
            setCurrentDealer(prev => ({ 
                ...prev,
                totalLimit: payload.totalLimit,
                amountDisbursed: payload.utilisationAmount,
                overdueAmount: payload.principalOverdue,
                status: payload.status,
                availableLimit: payload.totalLimit - payload.utilisationAmount, // Recalculate available limit
             }));
            setIsEditing(false);
        }
        setIsSaving(false);
  };
  
  const handleInputChange = (field: keyof typeof editValues, value: string) => {
      setEditValues(prev => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    if (open) {
      setCurrentDealer(dealer);
      setEditValues({
          totalLimit: dealer.totalLimit.toString(),
          amountDisbursed: dealer.amountDisbursed.toString(),
          overdueAmount: dealer.overdueAmount.toString(),
          status: dealer.status,
      });
      setIsEditing(false);
    }
  }, [open, dealer]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center pr-10">
            <span>{currentDealer.name}</span>
             {isEditing ? (
                 <div className="w-[150px]">
                    <Select value={editValues.status} onValueChange={(value) => handleInputChange('status', value)}>
                        <SelectTrigger className="h-8">
                            <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                            {dealerStatuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                    </Select>
                 </div>
             ) : (
                <StatusBadge status={currentDealer.status} />
             )}
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
                        <div className="space-y-1">
                            <Label className="text-muted-foreground">Total Limit</Label>
                            {isEditing ? (
                                <div className="relative">
                                    <IndianRupee className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                                    <Input value={editValues.totalLimit} onChange={(e) => handleInputChange('totalLimit', e.target.value)} className="h-8 pl-6" />
                                </div>
                            ) : (
                                <p className="font-semibold">{formatCurrency(currentDealer.totalLimit)}</p>
                            )}
                        </div>
                        <div className="space-y-1">
                            <Label className="text-muted-foreground">Amount Disbursed</Label>
                             {isEditing ? (
                                <div className="relative">
                                    <IndianRupee className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                                    <Input value={editValues.amountDisbursed} onChange={(e) => handleInputChange('amountDisbursed', e.target.value)} className="h-8 pl-6" />
                                </div>
                            ) : (
                                <p className="font-semibold">{formatCurrency(currentDealer.amountDisbursed)}</p>
                            )}
                        </div>
                        <div className="space-y-1">
                            <Label className="text-muted-foreground">Overdue Amount</Label>
                             {isEditing ? (
                                <div className="relative">
                                    <IndianRupee className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                                    <Input value={editValues.overdueAmount} onChange={(e) => handleInputChange('overdueAmount', e.target.value)} className="h-8 pl-6" />
                                </div>
                            ) : (
                                <p className="font-semibold text-destructive">{formatCurrency(currentDealer.overdueAmount)}</p>
                            )}
                        </div>
                         <div className="space-y-1">
                            <Label className="text-muted-foreground">Available Limit</Label>
                            <p className="font-semibold text-green-600">{formatCurrency(currentDealer.availableLimit)}</p>
                        </div>
                         <div className="space-y-1">
                            <Label className="text-muted-foreground">Associated Lender</Label>
                            <p className="font-semibold">{currentDealer.lenderName || 'N/A'}</p>
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
                    {isEditing ? (
                        <>
                           <Button variant="ghost" onClick={() => setIsEditing(false)} disabled={isSaving}>
                                <X className="mr-2 h-4 w-4" /> Cancel
                           </Button>
                           <Button onClick={handleSave} disabled={isSaving}>
                                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                Save Changes
                           </Button>
                        </>
                    ) : <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>}
                </div>
            </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
