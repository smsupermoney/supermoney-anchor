"use client";

import { useMemo, useState } from "react";
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import Link from "next/link";
import { ArrowRight, UploadCloud } from "lucide-react";
import UploadInvoiceDialog from "@/components/upload-invoice-dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function InvoicesPage() {
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);

  const [filters, setFilters] = useState({
    invoiceNumber: "",
    dealerName: "",
    lender: "",
    status: "",
  });

  const handleFilterChange = (
    filterName: keyof typeof filters,
    value: string
  ) => {
    setFilters((prev) => ({ ...prev, [filterName]: value }));
  };

  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      return (
        invoice.invoiceNumber
          .toLowerCase()
          .includes(filters.invoiceNumber.toLowerCase()) &&
        invoice.dealerName
          .toLowerCase()
          .includes(filters.dealerName.toLowerCase()) &&
        invoice.lender.toLowerCase().includes(filters.lender.toLowerCase()) &&
        (filters.status === "" || invoice.status === filters.status)
      );
    });
  }, [filters]);

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
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>All Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-4 p-2 border bg-muted/50 rounded-lg">
            <Input
              placeholder="Filter Invoice #"
              value={filters.invoiceNumber}
              onChange={(e) => handleFilterChange("invoiceNumber", e.target.value)}
              className="max-w-sm"
            />
            <Input
              placeholder="Filter Dealer"
              value={filters.dealerName}
              onChange={(e) => handleFilterChange("dealerName", e.target.value)}
              className="max-w-sm"
            />
            <Input
              placeholder="Filter Lender"
              value={filters.lender}
              onChange={(e) => handleFilterChange("lender", e.target.value)}
              className="max-w-sm"
            />
            <Select
              value={filters.status}
              onValueChange={(value) => handleFilterChange("status", value === "all" ? "" : value)}
            >
              <SelectTrigger className="max-w-sm">
                <SelectValue placeholder="Filter by Status" />
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
          </div>
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
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
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
                  <TableCell>
                    <Button asChild variant="ghost" size="icon">
                      <Link href={`/invoices/${invoice.id}`}>
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
