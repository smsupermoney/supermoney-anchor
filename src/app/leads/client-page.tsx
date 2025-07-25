
"use client";

import { useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import StatusBadge from "@/components/status-badge";
import type { MomentumDealerLead } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X as XIcon, ChevronDown, PlusCircle, Upload } from "lucide-react";
import { spokeStatuses } from "@/lib/data";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import PageHeader from "@/components/page-header";
import AddLeadDialog from "@/components/add-lead-dialog";
import BulkLeadUploadDialog from "@/components/bulk-lead-upload-dialog";
import { DataTablePagination } from "@/components/ui/data-table-pagination";

type LeadsClientPageProps = {
    initialLeads: MomentumDealerLead[];
};

export default function LeadsClientPage({ initialLeads }: LeadsClientPageProps) {
  const [leads, setLeads] = useState(initialLeads);
  const initialFilters = {
    name: "",
    city: "",
    zone: "",
    leadSource: "",
    status: [] as string[],
  };
  const [filters, setFilters] = useState(initialFilters);
  const [pageIndex, setPageIndex] = useState(0);
  const pageSize = 10;
  
  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', notation: 'compact' }).format(amount);
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-IN');

  const getLatestRemark = (lead: MomentumDealerLead) => {
    if (!lead.remarks || lead.remarks.length === 0) {
      return 'N/A';
    }
    const latestRemark = lead.remarks[lead.remarks.length - 1];
    if (typeof latestRemark === 'object' && latestRemark !== null) {
        // You might need to adjust this based on the actual remark structure
        return (latestRemark as any).remark || (latestRemark as any).text || 'View Details';
    }
    return 'View Details';
  };

  const handleFilterChange = (filterName: keyof Omit<typeof filters, 'status'>, value: string) => {
    setFilters((prev) => ({ ...prev, [filterName]: value }));
  };

  const handleStatusFilterChange = (status: string) => {
    setFilters((prev) => {
      const newStatuses = prev.status.includes(status)
        ? prev.status.filter((s) => s !== status)
        : [...prev.status, status];
      return { ...prev, status: newStatuses };
    });
  };

  const clearFilters = () => {
    setFilters(initialFilters);
  };
  
  const hasActiveFilters = useMemo(() => {
    return Object.values(filters).some(val => Array.isArray(val) ? val.length > 0 : val !== "");
  }, [filters]);

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const statusCondition =
        filters.status.length === 0 ||
        filters.status.some(s => s.toLowerCase() === (lead.status || '').toLowerCase());

      return (
        (lead.name || '').toLowerCase().includes(filters.name.toLowerCase()) &&
        (lead.city || '').toLowerCase().includes(filters.city.toLowerCase()) &&
        (lead.zone || '').toLowerCase().includes(filters.zone.toLowerCase()) &&
        (lead.leadSource || '').toLowerCase().includes(filters.leadSource.toLowerCase()) &&
        statusCondition
      );
    });
  }, [filters, leads]);
  
  const pageCount = Math.ceil(filteredLeads.length / pageSize);
  const paginatedLeads = useMemo(() => {
    const start = pageIndex * pageSize;
    const end = start + pageSize;
    return filteredLeads.slice(start, end);
  }, [filteredLeads, pageIndex, pageSize]);

  useEffect(() => {
    setPageIndex(0);
  }, [filters]);


  return (
    <>
        <PageHeader title="All Leads">
            <div className="flex items-center gap-2">
                <BulkLeadUploadDialog>
                    <Button variant="outline">
                        <Upload className="mr-2 h-4 w-4"/>
                        Bulk Lead Upload
                    </Button>
                </BulkLeadUploadDialog>
                <AddLeadDialog>
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4"/>
                        Add Lead
                    </Button>
                </AddLeadDialog>
            </div>
        </PageHeader>
        <div className='mt-4'>
            <Card>
                <CardHeader>
                    <CardTitle>All Leads</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-wrap items-center gap-2">
                        <Input
                        placeholder="Filter by name..."
                        value={filters.name}
                        onChange={(e) => handleFilterChange("name", e.target.value)}
                        className="h-9 max-w-40"
                        />
                        <Input
                        placeholder="Filter by city..."
                        value={filters.city}
                        onChange={(e) => handleFilterChange("city", e.target.value)}
                        className="h-9 max-w-40"
                        />
                        <Input
                        placeholder="Filter by zone..."
                        value={filters.zone}
                        onChange={(e) => handleFilterChange("zone", e.target.value)}
                        className="h-9 max-w-40"
                        />
                        <Input
                        placeholder="Filter by source..."
                        value={filters.leadSource}
                        onChange={(e) => handleFilterChange("leadSource", e.target.value)}
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
                            {spokeStatuses.map((status) => (
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
                            <TableHead>Name</TableHead>
                            <TableHead>City</TableHead>
                            <TableHead>Zone</TableHead>
                            <TableHead>Lead Source</TableHead>
                            <TableHead>Deal Value</TableHead>
                            <TableHead>Lead Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Latest Remark</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {paginatedLeads.map((lead) => (
                            <TableRow key={lead.id}>
                            <TableCell className="font-medium">{lead.name}</TableCell>
                            <TableCell>{lead.city}</TableCell>
                            <TableCell>{lead.zone}</TableCell>
                            <TableCell>{lead.leadSource}</TableCell>
                            <TableCell>
                                <Badge variant="secondary">{formatCurrency(lead.dealValue * 100000)}</Badge>
                            </TableCell>
                            <TableCell>{formatDate(lead.leadDate)}</TableCell>
                            <TableCell>
                                <StatusBadge status={lead.status as any} />
                            </TableCell>
                            <TableCell className="text-muted-foreground truncate max-w-xs">{getLatestRemark(lead)}</TableCell>
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
        </div>
    </>
  );
}
