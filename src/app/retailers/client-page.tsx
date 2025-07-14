
"use client";

import { useMemo, useState, useEffect } from "react";
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Upload, UploadCloud, X as XIcon } from "lucide-react";
import StatusBadge from "@/components/status-badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Dealer } from "@/types";
import DealerDetailDialog from "@/components/dealer-detail-dialog";
import UploadInvoiceDialog from "@/components/upload-invoice-dialog";
import { useSearchParams } from "next/navigation";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type RetailersClientPageProps = {
  initialDealers: Dealer[];
  isAdmin: boolean;
};

export default function RetailersClientPage({ initialDealers, isAdmin }: RetailersClientPageProps) {
  const [dealers, setDealers] = useState(initialDealers);
  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
  
  const lenderFullNameMapping: Record<string, string> = {
    'CHOLAMANDALAM INVEST...': 'CHOLAMANDALAM INVESTMENT AND FINANCE COMPANY LIMITED',
    'ADITYA BIRLA CAPITAL LTD': 'ADITYA BIRLA CAPITAL LTD',
    'Supply Chain Finance Co.': 'Supply Chain Finance Co.',
    'Flexi Loans': 'Flexi Loans',
    'Supermoney Finance': 'Supermoney Finance'
  };

  const initialFilters = {
    name: "",
    lender: "",
    status: "",
  };

  const searchParams = useSearchParams();
  const lenderQuery = searchParams.get('lender');

  const [filters, setFilters] = useState({...initialFilters, lender: lenderQuery || ""});
  const [selectedDealer, setSelectedDealer] = useState<Dealer | null>(null);

  useEffect(() => {
    const lender = searchParams.get('lender');
    if (lender) {
      setFilters(prev => ({ ...prev, lender: lender }));
    }
  }, [searchParams]);

  const handleFilterChange = (
    filterName: keyof typeof filters,
    value: string
  ) => {
    setFilters((prev) => ({ ...prev, [filterName]: value }));
  };

  const clearFilters = () => {
    setFilters(initialFilters);
  };
  
  const hasActiveFilters = useMemo(() => {
    return Object.values(filters).some(val => val !== "");
  }, [filters]);

  const filteredDealers = useMemo(() => {
    return dealers.filter((dealer) => {
      const lenderMatch = filters.lender === "" || dealer.lenders.some(l => l.toLowerCase().includes(filters.lender.toLowerCase()));
      return (
        dealer.name.toLowerCase().includes(filters.name.toLowerCase()) &&
        lenderMatch &&
        (filters.status === "" || dealer.status === filters.status)
      );
    });
  }, [filters, dealers]);
  
  const dealerStatuses = ["Active", "Inactive", "Pending"];

  return (
    <>
      <PageHeader title="Dealers">
        {isAdmin ? (
          <div className="flex gap-2">
            <Button variant="outline"><Upload className="mr-2 h-4 w-4"/>Upload Excel</Button>
            <Button><PlusCircle className="mr-2 h-4 w-4"/>Add Dealer</Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <UploadInvoiceDialog>
              <Button variant="outline">
                <UploadCloud className="mr-2 h-4 w-4" />
                Raise Invoice
              </Button>
            </UploadInvoiceDialog>
            <Button>
              <PlusCircle className="mr-2" />
              Add Dealer
            </Button>
          </div>
        )}
      </PageHeader>
      <Card className="mt-6">
        <CardHeader>
            <CardTitle>All Dealers</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <Input
              placeholder="Filter by name..."
              value={filters.name}
              onChange={(e) => handleFilterChange("name", e.target.value)}
              className="h-9 max-w-40"
            />
            <Input
              placeholder="Filter by lender..."
              value={filters.lender}
              onChange={(e) => handleFilterChange("lender", e.target.value)}
              className="h-9 max-w-40"
            />
             <Select
              value={filters.status}
              onValueChange={(value) => handleFilterChange("status", value === "all" ? "" : value)}
            >
              <SelectTrigger className="h-9 max-w-40 data-[placeholder]:text-muted-foreground">
                <SelectValue placeholder="Filter by status..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {dealerStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <XIcon className="mr-2 h-4 w-4" />
                Clear Filters
              </Button>
            )}
          </div>
          <div className="relative w-full overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Dealer Name</TableHead>
                  <TableHead>Lenders</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Credit Assigned</TableHead>
                  <TableHead className="text-right">Invoices</TableHead>
                  <TableHead className="text-right">Amount Disbursed</TableHead>
                  <TableHead className="text-right">Overdue</TableHead>
                  <TableHead className="text-right">Overdue Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDealers.map((dealer) => (
                  <TableRow key={dealer.id} onClick={() => setSelectedDealer(dealer)} className="cursor-pointer">
                    <TableCell className="font-medium">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="truncate max-w-[150px]">{dealer.name}</div>
                          </TooltipTrigger>
                          <TooltipContent><p>{dealer.name}</p></TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="truncate max-w-[200px]">{dealer.lenders.join(', ')}</div>
                          </TooltipTrigger>
                           <TooltipContent><p>{dealer.lenders.map(l => lenderFullNameMapping[l] || l).join(', ')}</p></TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div><StatusBadge status={dealer.status} /></div>
                          </TooltipTrigger>
                          <TooltipContent><p>{dealer.status}</p></TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell className="text-right">
                       <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="truncate max-w-[120px] ml-auto">{formatCurrency(dealer.creditAssigned)}</div>
                          </TooltipTrigger>
                          <TooltipContent><p>{formatCurrency(dealer.creditAssigned)}</p></TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell className="text-right">{dealer.invoicesSubmitted}</TableCell>
                    <TableCell className="text-right">
                       <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="truncate max-w-[120px] ml-auto">{formatCurrency(dealer.amountDisbursed)}</div>
                          </TooltipTrigger>
                          <TooltipContent><p>{formatCurrency(dealer.amountDisbursed)}</p></TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell className="text-right">{dealer.overdueCount}</TableCell>
                    <TableCell className="text-right">
                       <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="truncate max-w-[120px] ml-auto">{formatCurrency(dealer.overdueAmount)}</div>
                          </TooltipTrigger>
                          <TooltipContent><p>{formatCurrency(dealer.overdueAmount)}</p></TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      {selectedDealer && (
        <DealerDetailDialog
          dealer={selectedDealer}
          open={!!selectedDealer}
          onOpenChange={(open) => {
            if (!open) setSelectedDealer(null);
          }}
        />
      )}
    </>
  );
}
