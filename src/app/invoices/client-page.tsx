
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
import { invoiceStatuses } from "@/lib/data";
import StatusBadge from "@/components/status-badge";
import { Upload, UploadCloud, Calendar as CalendarIcon, X as XIcon, ChevronDown, PlusCircle } from "lucide-react";
import UploadInvoiceDialog from "@/components/upload-invoice-dialog";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { DateRange } from "react-day-picker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import InvoiceDetailDialog from "@/components/invoice-detail-dialog";
import type { Invoice, InvoiceStatus } from "@/types";
import { useSearchParams } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type InvoicesClientPageProps = {
  initialInvoices: Invoice[];
  isAdmin: boolean;
};

export default function InvoicesClientPage({ initialInvoices, isAdmin }: InvoicesClientPageProps) {
  const [invoices, setInvoices] = useState(initialInvoices);
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);

  const lenderFullNameMapping: Record<string, string> = {
    'CHOLAMANDALAM INVEST...': 'CHOLAMANDALAM INVESTMENT AND FINANCE COMPANY LIMITED',
    'ADITYA BIRLA CAPITAL LTD': 'ADITYA BIRLA CAPITAL LTD',
    'Supply Chain Finance Co.': 'Supply Chain Finance Co.',
    'Flexi Loans': 'Flexi Loans',
    'Supermoney Finance': 'Supermoney Finance'
  };
  
  const initialFilters = {
    invoiceNumber: "",
    dealerName: "",
    lender: "",
    status: [] as InvoiceStatus[],
    overdue: "",
  };
  
  const searchParams = useSearchParams();
  
  const [date, setDate] = useState<DateRange | undefined>();
  const [filters, setFilters] = useState(() => {
    const lenderQuery = searchParams.get('lender');
    const overdueQuery = searchParams.get('overdue');
    const statusQuery = searchParams.get('status');
    const dealerNameQuery = searchParams.get('dealerName');
    const statusArray = statusQuery ? statusQuery.split(',') as InvoiceStatus[] : [];
    return {...initialFilters, lender: lenderQuery || "", overdue: overdueQuery || "", status: statusArray, dealerName: dealerNameQuery || ""};
  });
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  
  useEffect(() => {
    const lender = searchParams.get('lender');
    const overdue = searchParams.get('overdue');
    const status = searchParams.get('status');
    const dealerName = searchParams.get('dealerName');
    const statusArray = status ? status.split(',') as InvoiceStatus[] : [];
    setFilters(prev => ({...prev, lender: lender || "", overdue: overdue || "", status: statusArray, dealerName: dealerName || ""}));
  }, [searchParams]);

  const handleStatusFilterChange = (status: InvoiceStatus) => {
    setFilters((prev) => {
      const newStatuses = prev.status.includes(status)
        ? prev.status.filter((s) => s !== status)
        : [...prev.status, status];
      return { ...prev, status: newStatuses };
    });
  };

  const handleFilterChange = (
    filterName: keyof Omit<typeof filters, 'status'>,
    value: string
  ) => {
    setFilters((prev) => ({ ...prev, [filterName]: value }));
  };

  const clearFilters = () => {
    setFilters(initialFilters);
    setDate(undefined);
  };
  
  const hasActiveFilters = useMemo(() => {
    return Object.values(filters).some(val => Array.isArray(val) ? val.length > 0 : val !== "") || !!date;
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

      const statusCondition =
        filters.status.length === 0 || filters.status.includes(invoice.status);

      return (
        invoice.invoiceNumber
          .toLowerCase()
          .includes(filters.invoiceNumber.toLowerCase()) &&
        invoice.dealerName
          .toLowerCase()
          .includes(filters.dealerName.toLowerCase()) &&
        invoice.lender.toLowerCase().includes(filters.lender.toLowerCase()) &&
        statusCondition &&
        overdueCondition &&
        isAfterStartDate &&
        isBeforeEndDate
      );
    });
  }, [filters, date, invoices]);

  return (
    <>
      <PageHeader title="Invoices" />
      <Card className="mt-4">
        <CardContent className="pt-6 grid gap-4">
          <div className="flex flex-wrap items-center gap-2">
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
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-9 max-w-60">
                  Status
                  {filters.status.length > 0 && (
                    <>
                      <Separator orientation="vertical" className="mx-2 h-4" />
                      <Badge variant="secondary" className="rounded-sm px-1 font-normal lg:hidden">
                        {filters.status.length}
                      </Badge>
                      <div className="hidden space-x-1 lg:flex">
                        {filters.status.length > 2 ? (
                          <Badge variant="secondary" className="rounded-sm px-1 font-normal">
                            {filters.status.length} selected
                          </Badge>
                        ) : (
                          filters.status.map((status) => (
                            <Badge
                              variant="secondary"
                              key={status}
                              className="rounded-sm px-1 font-normal"
                            >
                              {status}
                            </Badge>
                          ))
                        )}
                      </div>
                    </>
                  )}
                  <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="start">
                <DropdownMenuLabel>Filter by status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {invoiceStatuses.map((status) => (
                  <DropdownMenuCheckboxItem
                    key={status}
                    checked={filters.status.includes(status)}
                    onCheckedChange={() => handleStatusFilterChange(status)}
                    onSelect={(e) => e.preventDefault()} // prevent menu from closing
                  >
                    {status}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Popover>
               <PopoverTrigger asChild>
                <Button
                  id="overdue-select"
                  variant="outline"
                  className={cn("h-9 w-[150px] justify-start text-left font-normal",
                    !filters.overdue && "text-muted-foreground"
                  )}
                >
                  {filters.overdue ? (
                    <>{filters.overdue === 'yes' ? 'Overdue: Yes' : 'Overdue: No'}</>
                  ) : (
                    <>Overdue?</>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <div className="flex flex-col">
                  <Button variant="ghost" className="justify-start" onClick={() => handleFilterChange('overdue', 'yes')}>Yes</Button>
                  <Button variant="ghost" className="justify-start" onClick={() => handleFilterChange('overdue', 'no')}>No</Button>
                  <Button variant="ghost" className="justify-start" onClick={() => handleFilterChange('overdue', '')}>All</Button>
                </div>
              </PopoverContent>
            </Popover>

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
                    <TableCell className="font-medium text-primary">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="truncate max-w-[100px]">{invoice.invoiceNumber}</div>
                          </TooltipTrigger>
                          <TooltipContent><p>{invoice.invoiceNumber}</p></TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="truncate max-w-[120px]">{invoice.dealerName}</div>
                          </TooltipTrigger>
                          <TooltipContent><p>{invoice.dealerName}</p></TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="truncate max-w-[120px]">{invoice.lender}</div>
                          </TooltipTrigger>
                          <TooltipContent><p>{lenderFullNameMapping[invoice.lender] || invoice.lender}</p></TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell>
                      <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="truncate max-w-[100px]">{invoice.date}</div>
                            </TooltipTrigger>
                            <TooltipContent><p>{invoice.date}</p></TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="truncate max-w-[100px]">{invoice.dueDate}</div>
                          </TooltipTrigger>
                          <TooltipContent><p>{invoice.dueDate}</p></TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell className="text-right">
                       <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="truncate max-w-[120px] ml-auto">{formatCurrency(invoice.amount)}</div>
                          </TooltipTrigger>
                          <TooltipContent><p>{formatCurrency(invoice.amount)}</p></TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell className="text-right text-destructive">
                       <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="truncate max-w-[100px] ml-auto">{invoice.overdueAmount > 0 ? formatCurrency(invoice.overdueAmount) : "-"}</div>
                          </TooltipTrigger>
                          <TooltipContent><p>{invoice.overdueAmount > 0 ? formatCurrency(invoice.overdueAmount) : "-"}</p></TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                       <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div><StatusBadge status={invoice.status} /></div>
                          </TooltipTrigger>
                          <TooltipContent><p>{invoice.status}</p></TooltipContent>
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
