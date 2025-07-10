"use client";

import { useMemo, useState } from "react";
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { dealers } from "@/lib/data";
import { PlusCircle, X as XIcon } from "lucide-react";
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

export default function DealersPage() {
  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

  const initialFilters = {
    name: "",
    lender: "",
    status: "",
  };

  const [filters, setFilters] = useState(initialFilters);
  const [selectedDealer, setSelectedDealer] = useState<Dealer | null>(null);

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
      return (
        dealer.name.toLowerCase().includes(filters.name.toLowerCase()) &&
        dealer.lender.toLowerCase().includes(filters.lender.toLowerCase()) &&
        (filters.status === "" || dealer.status === filters.status)
      );
    });
  }, [filters]);
  
  const dealerStatuses = ["Active", "Inactive", "Pending"];

  return (
    <>
      <PageHeader title="Dealers">
        <Button>
          <PlusCircle className="mr-2" />
          Add Dealer
        </Button>
      </PageHeader>
      <Card className="mt-6">
        <CardHeader>
            <CardTitle>All Dealers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-2 mb-4">
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Dealer Name</TableHead>
                <TableHead>Lender</TableHead>
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
                  <TableCell className="font-medium">{dealer.name}</TableCell>
                  <TableCell>{dealer.lender}</TableCell>
                  <TableCell><StatusBadge status={dealer.status} /></TableCell>
                  <TableCell className="text-right">{formatCurrency(dealer.creditAssigned)}</TableCell>
                  <TableCell className="text-right">{dealer.invoicesSubmitted}</TableCell>
                  <TableCell className="text-right">{formatCurrency(dealer.amountDisbursed)}</TableCell>
                  <TableCell className="text-right">{dealer.overdueCount}</TableCell>
                  <TableCell className="text-right">{formatCurrency(dealer.overdueAmount)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
