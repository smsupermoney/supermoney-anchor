
"use client";

import { useMemo, useState, useEffect } from "react";
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { X as XIcon } from "lucide-react";
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
import { useSearchParams } from "next/navigation";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DataTablePagination } from "@/components/ui/data-table-pagination";

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
    overdue: "",
  };

  const searchParams = useSearchParams();
  
  const [filters, setFilters] = useState(() => {
    const lenderQuery = searchParams.get('lender');
    const overdueQuery = searchParams.get('overdue');
    return {...initialFilters, lender: lenderQuery || "", overdue: overdueQuery || ""};
  });
  const [selectedDealer, setSelectedDealer] = useState<Dealer | null>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const pageSize = 10;
  
  useEffect(() => {
    const lender = searchParams.get('lender');
    const overdue = searchParams.get('overdue');
    setFilters(prev => ({...prev, lender: lender || "", overdue: overdue || ""}));
  }, [searchParams]);
  
  useEffect(() => {
    setPageIndex(0);
  }, [filters]);


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
      const lenderMatch = filters.lender === "" || (dealer.lenderName ?? "").toLowerCase().includes(filters.lender.toLowerCase());
      
      const overdueMatch =
        filters.overdue === "" ||
        (filters.overdue === "yes" && dealer.overdueAmount > 0) ||
        (filters.overdue === "no" && dealer.overdueAmount === 0);

      return (
        dealer.name.toLowerCase().includes(filters.name.toLowerCase()) &&
        lenderMatch &&
        (filters.status === "" || dealer.status.toLowerCase() === filters.status.toLowerCase()) &&
        overdueMatch
      );
    });
  }, [filters, dealers]);
  
  const pageCount = Math.ceil(filteredDealers.length / pageSize);
  const paginatedDealers = useMemo(() => {
      const start = pageIndex * pageSize;
      const end = start + pageSize;
      return filteredDealers.slice(start, end);
  }, [filteredDealers, pageIndex, pageSize]);

  const dealerStatuses = ["Active", "Inactive", "Pending", "Supply Stopped"];

  return (
    <>
      <PageHeader title="Dealers" />
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
                className="h-9 max-w-48"
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
            <Select
              value={filters.overdue}
              onValueChange={(value) => handleFilterChange("overdue", value === "all" ? "" : value)}
            >
              <SelectTrigger className="h-9 w-[150px] data-[placeholder]:text-muted-foreground">
                <SelectValue placeholder="Filter by Overdue..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Overdue Status</SelectItem>
                <SelectItem value="yes">Overdue</SelectItem>
                <SelectItem value="no">Not Overdue</SelectItem>
              </SelectContent>
            </Select>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <XIcon className="mr-2 h-4 w-4" />
                Clear Filters
              </Button>
            )}
          </div>
          <div className="relative w-full overflow-auto border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Dealer ID</TableHead>
                  <TableHead>Dealer Name</TableHead>
                  <TableHead>Email Address</TableHead>
                  {isAdmin && <TableHead>Anchor</TableHead>}
                  <TableHead>Lender</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total Limit</TableHead>
                  <TableHead className="text-right">Amount Disbursed</TableHead>
                  <TableHead className="text-right">Available Limit</TableHead>
                  <TableHead className="text-right">Overdue Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedDealers.map((dealer) => (
                  <TableRow key={dealer.id} onClick={() => setSelectedDealer(dealer)} className="cursor-pointer">
                    <TableCell className="font-medium">
                       <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="truncate max-w-[100px]">{dealer.id}</div>
                          </TooltipTrigger>
                          <TooltipContent><p>{dealer.id}</p></TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
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
                            <div className="truncate max-w-[150px]">{dealer.emailAddress || 'N/A'}</div>
                          </TooltipTrigger>
                          <TooltipContent><p>{dealer.emailAddress || 'N/A'}</p></TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    {isAdmin && (
                        <TableCell>
                            <TooltipProvider>
                                <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="truncate max-w-[150px]">{dealer.anchorName || 'N/A'}</div>
                                </TooltipTrigger>
                                <TooltipContent><p>{dealer.anchorName || 'N/A'}</p></TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </TableCell>
                    )}
                    <TableCell>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="truncate max-w-[200px]">{dealer.lenderName}</div>
                          </TooltipTrigger>
                           <TooltipContent><p>{lenderFullNameMapping[dealer.lenderName] || dealer.lenderName}</p></TooltipContent>
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
                            <div className="truncate max-w-[120px] ml-auto">{formatCurrency(dealer.totalLimit ?? 0)}</div>
                          </TooltipTrigger>
                          <TooltipContent><p>{formatCurrency(dealer.totalLimit ?? 0)}</p></TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
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
                     <TableCell className="text-right">
                       <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="truncate max-w-[120px] ml-auto">{formatCurrency(dealer.availableLimit)}</div>
                          </TooltipTrigger>
                          <TooltipContent><p>{formatCurrency(dealer.availableLimit)}</p></TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell className="text-right text-destructive">
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
           <DataTablePagination
              pageIndex={pageIndex}
              pageCount={pageCount}
              setPageIndex={setPageIndex}
              hasNextPage={pageIndex < pageCount - 1}
              hasPreviousPage={pageIndex > 0}
            />
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
