

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
import { Calendar as CalendarIcon, X as XIcon, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { DateRange } from "react-day-picker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format, parseISO, isValid } from "date-fns";
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
import { DataTablePagination } from "@/components/ui/data-table-pagination";

type InvoicesClientPageProps = {
  initialInvoices: Invoice[];
  isAdmin: boolean;
};

const sanitizeParam = (str: string | null): string | undefined =>
  str?.replace(' ', '+');

// Helper function to parse URL params into a DateRange object
const getInitialDateRange = (searchParams: URLSearchParams): DateRange | undefined => {
    const dateFromParam = sanitizeParam(searchParams.get('dateFrom'));
    const dateToParam = sanitizeParam(searchParams.get('dateTo'));
    console.log('Parsing:', { dateFromParam, dateToParam });
    console.log('Date object:', parseISO(dateFromParam ?? ''));
    if (dateFromParam && dateToParam) {
        const from = parseISO(dateFromParam);
        const to = parseISO(dateToParam);
        if (isValid(from) && isValid(to)) {
            return { from, to };
        }
    }
    return undefined;
};

// Helper function to parse URL params into filter state
const getInitialFilters = (searchParams: URLSearchParams) => {
    return {
      invoiceNumber: searchParams.get('invoiceNumber') || "",
      dealerName: searchParams.get('dealerName') || "",
      lender: searchParams.get('lender') || "",
      status: searchParams.get('status')?.split(',') as InvoiceStatus[] || [],
      overdue: searchParams.get('overdue') || "",
    };
};

export default function InvoicesClientPage({ initialInvoices, isAdmin }: InvoicesClientPageProps) {
  const searchParams = useSearchParams();

  // Initialize state directly from URL search parameters
  const [filters, setFilters] = useState(() => getInitialFilters(searchParams));
  const [date, setDate] = useState<DateRange | undefined>(() => getInitialDateRange(searchParams));
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [pageIndex, setPageIndex] = useState(0);

  const pageSize = 10;
  
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

  // Function to map detailed status to a simplified display status
  const getDisplayStatus = (status: InvoiceStatus): 'Disbursed' | 'Rejected' | 'Pending' | 'Repaid' => {
      switch (status) {
          case 'Disbursed':
              return 'Disbursed';
          case 'Rejected':
              return 'Rejected';
          case 'Repaid':
              return 'Repaid';
          case 'Initiated':
          case 'Approved':
          case 'Sent to Lender':
              return 'Pending';
          default:
              return 'Pending';
      }
  };

  // This effect ensures that if the user navigates (e.g., browser back/forward),
  // the state is updated to reflect the new URL parameters.
  useEffect(() => {
    setFilters(getInitialFilters(searchParams));
    setDate(getInitialDateRange(searchParams));
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
    setFilters({
        invoiceNumber: "",
        dealerName: "",
        lender: "",
        status: [],
        overdue: "",
    });
    setDate(undefined);
  };
  
  const hasActiveFilters = useMemo(() => {
    return Object.values(filters).some(val => Array.isArray(val) ? val.length > 0 : val !== "") || !!date;
  }, [filters, date]);

  const filteredInvoices = useMemo(() => {
    return initialInvoices.filter((invoice) => {
      const invoiceDate = new Date(invoice.date);
      const isAfterStartDate = !date?.from || invoiceDate >= date.from;
      const isBeforeEndDate = !date?.to || invoiceDate <= date.to;

      const overdueCondition =
        filters.overdue === "" ||
        (filters.overdue === "yes" && (invoice.overdueAmount ?? 0) > 0) ||
        (filters.overdue === "no" && (invoice.overdueAmount ?? 0) === 0);

      const statusCondition =
        filters.status.length === 0 || filters.status.includes(invoice.status);

      return (
        invoice.invoiceNumber
          .toLowerCase()
          .includes(filters.invoiceNumber.toLowerCase()) &&
        (invoice.dealerName ?? '')
          .toLowerCase()
          .includes(filters.dealerName.toLowerCase()) &&
        (invoice.lender ?? '').toLowerCase().includes(filters.lender.toLowerCase()) &&
        statusCondition &&
        overdueCondition &&
        isAfterStartDate &&
        isBeforeEndDate
      );
    });
  }, [filters, date, initialInvoices]);
  
  const pageCount = Math.ceil(filteredInvoices.length / pageSize);
  const paginatedInvoices = useMemo(() => {
      const start = pageIndex * pageSize;
      const end = start + pageSize;
      return filteredInvoices.slice(start, end);
  }, [filteredInvoices, pageIndex, pageSize]);

  useEffect(() => {
    setPageIndex(0);
  }, [filters, date]);


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
                placeholder="Filter by dealer..."
                value={filters.dealerName}
                onChange={(e) => handleFilterChange("dealerName", e.target.value)}
                className="h-9 max-w-48"
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
                    <>Overdue</>
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
          <div className="relative w-full overflow-auto border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>UTR #</TableHead>
                  <TableHead>Dealer</TableHead>
                  {isAdmin && <TableHead>Anchor</TableHead>}
                  <TableHead>Lender</TableHead>
                  <TableHead>Invoice Date</TableHead>
                  <TableHead>Disbursed Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Remarks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedInvoices.map((invoice) => (
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
                            <div className="truncate max-w-[120px]">{invoice.utrNo || '-'}</div>
                          </TooltipTrigger>
                          <TooltipContent><p>{invoice.utrNo || 'N/A'}</p></TooltipContent>
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
                    {isAdmin && (
                        <TableCell>
                            <TooltipProvider>
                                <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="truncate max-w-[120px]">{invoice.anchorName || 'N/A'}</div>
                                </TooltipTrigger>
                                <TooltipContent><p>{invoice.anchorName || 'N/A'}</p></TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </TableCell>
                    )}
                    <TableCell>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="truncate max-w-[120px]">{invoice.lender}</div>
                          </TooltipTrigger>
                          <TooltipContent><p>{lenderFullNameMapping[invoice.lender ?? ''] || invoice.lender}</p></TooltipContent>
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
                            <div className="truncate max-w-[100px]">{invoice.disburseDate || '-'}</div>
                          </TooltipTrigger>
                          <TooltipContent><p>{invoice.disburseDate || 'N/A'}</p></TooltipContent>
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
                    <TableCell className="whitespace-nowrap">
                       <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div><StatusBadge status={getDisplayStatus(invoice.status)} /></div>
                          </TooltipTrigger>
                          <TooltipContent><p>{invoice.status}</p></TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="truncate max-w-[150px]">{invoice.remarks || '-'}</div>
                          </TooltipTrigger>
                          <TooltipContent><p>{invoice.remarks || 'N/A'}</p></TooltipContent>
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
