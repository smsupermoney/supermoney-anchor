
"use client";

import { useEffect, useMemo, useState } from "react";
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { invoices, invoiceStatuses } from "@/lib/data";
import StatusBadge from "@/components/status-badge";
import { UploadCloud, Calendar as CalendarIcon, X as XIcon } from "lucide-react";
import UploadInvoiceDialog from "@/components/upload-invoice-dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { DateRange } from "react-day-picker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import InvoiceDetailDialog from "@/components/invoice-detail-dialog";
import type { Invoice } from "@/types";
import { useSearchParams } from "next/navigation";

export default function InvoicesPage() {
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);

  const initialFilters = {
    invoiceNumber: "",
    dealerName: "",
    lender: "",
    status: "",
    overdue: "",
  };
  
  const searchParams = useSearchParams();
  const lenderQuery = searchParams.get('lender');

  const [date, setDate] = useState<DateRange | undefined>();
  const [filters, setFilters] = useState({...initialFilters, lender: lenderQuery || ""});
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  
  useEffect(() => {
    const lender = searchParams.get('lender');
    if (lender) {
      setFilters(prev => ({...prev, lender: lender}));
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
    setDate(undefined);
  };
  
  const hasActiveFilters = useMemo(() => {
    return Object.values(filters).some(val => val !== "") || !!date;
  }, [filters, date]);

  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      const invoiceDate = new Date(invoice.date);
      const isAfterStartDate = !date?.from || invoiceDate >= date.from;
      const isBeforeEndDate = !date?.to || invoiceDate <= date.to;

      const overdueCondition =
        filters.overdue === "" ||
        (filters.overdue === "yes" && invoice.overdueAmount > 0) ||
        (filters.overdue === "no" && invoice.overdueAmount === 0);

      return (
        invoice.invoiceNumber
          .toLowerCase()
          .includes(filters.invoiceNumber.toLowerCase()) &&
        invoice.dealerName
          .toLowerCase()
          .includes(filters.dealerName.toLowerCase()) &&
        invoice.lender.toLowerCase().includes(filters.lender.toLowerCase()) &&
        (filters.status === "" || invoice.status === filters.status) &&
        overdueCondition &&
        isAfterStartDate &&
        isBeforeEndDate
      );
    });
  }, [filters, date]);

  return (
    <>
      <PageHeader title="Invoices">
        <UploadInvoiceDialog>
          <Button>
            <UploadCloud className="mr-2 h-4 w-4" />
            Raise Invoice
          </Button>
        </UploadInvoiceDialog>
      </PageHeader>
      <Card className="mt-4">
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <Input
              placeholder="Filter Invoice #"
              value={filters.invoiceNumber}
              onChange={(e) => handleFilterChange("invoiceNumber", e.target.value)}
              className="h-9 max-w-40"
            />
            <Input
              placeholder="Filter Dealer"
              value={filters.dealerName}
              onChange={(e) => handleFilterChange("dealerName", e.target.value)}
              className="h-9 max-w-40"
            />
            <Input
              placeholder="Filter Lender"
              value={filters.lender}
              onChange={(e) => handleFilterChange("lender", e.target.value)}
              className="h-9 max-w-40"
            />
            <Select
              value={filters.status}
              onValueChange={(value) => handleFilterChange("status", value === "all" ? "" : value)}
            >
              <SelectTrigger className="h-9 max-w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {invoiceStatuses.map((status) => (
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
              <SelectTrigger className="h-9 max-w-40">
                <SelectValue placeholder="Overdue?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant={"outline"}
                  className={cn(
                    "h-9 w-[260px] justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date?.from ? (
                    date.to ? (
                      <>
                        {format(date.from, "LLL dd, y")} -{" "}
                        {format(date.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(date.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={date?.from}
                  selected={date}
                  onSelect={setDate}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <XIcon className="mr-2 h-4 w-4" />
                Clear
              </Button>
            )}
          </div>
          <div className="relative w-full overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Dealer</TableHead>
                  <TableHead>Lender</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Overdue Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id} onClick={() => setSelectedInvoice(invoice)} className="cursor-pointer">
                    <TableCell className="font-medium">
                      {invoice.invoiceNumber}
                    </TableCell>
                    <TableCell>{invoice.dealerName}</TableCell>
                    <TableCell>{invoice.lender}</TableCell>
                    <TableCell>{invoice.date}</TableCell>
                    <TableCell>{invoice.dueDate}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(invoice.amount)}
                    </TableCell>
                    <TableCell className="text-right text-destructive">
                      {invoice.overdueAmount > 0 ? formatCurrency(invoice.overdueAmount) : "-"}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={invoice.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      {selectedInvoice && (
        <InvoiceDetailDialog 
            invoice={selectedInvoice} 
            open={!!selectedInvoice} 
            onOpenChange={(open) => {
                if(!open) setSelectedInvoice(null);
            }} 
        />
      )}
    </>
  );
}
