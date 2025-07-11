
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import StatusBadge from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Archive, Ban } from "lucide-react";
import type { Dealer } from "@/types";

type DealerDetailDialogProps = {
  dealer: Dealer;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function DealerDetailDialog({ dealer, open, onOpenChange }: DealerDetailDialogProps) {
  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center pr-10">
            <span>{dealer.name}</span>
            <StatusBadge status={dealer.status} />
          </DialogTitle>
          <DialogDescription>
            Dealer ID: {dealer.id}
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
                            <span className="text-muted-foreground">Credit Assigned</span>
                            <span className="font-semibold">{formatCurrency(dealer.creditAssigned)}</span>
                        </div>
                        <div className="flex justify-between items-baseline">
                            <span className="text-muted-foreground">Amount Disbursed</span>
                            <span className="font-semibold">{formatCurrency(dealer.amountDisbursed)}</span>
                        </div>
                         <div className="flex justify-between items-baseline">
                            <span className="text-muted-foreground">Overdue Amount</span>
                            <span className="font-semibold text-destructive">{formatCurrency(dealer.overdueAmount)}</span>
                        </div>
                        <div className="flex justify-between items-baseline col-span-2">
                            <span className="text-muted-foreground">Associated Lenders</span>
                            <span className="font-semibold text-right">{dealer.lenders.join(', ')}</span>
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
                            <span className="font-semibold">{dealer.invoicesSubmitted}</span>
                        </div>
                        <div className="flex justify-between items-baseline">
                            <span className="text-muted-foreground">Overdue Invoices</span>
                            <span className="font-semibold text-destructive">{dealer.overdueCount}</span>
                        </div>
                     </div>
                </CardContent>
            </Card>
        </div>
        <DialogFooter className="gap-2 sm:justify-end">
            <Button variant="outline">
                <Archive className="mr-2 h-4 w-4" />
                Archive Dealer
            </Button>
            <Button variant="destructive">
                <Ban className="mr-2 h-4 w-4" />
                Stop Finance
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
