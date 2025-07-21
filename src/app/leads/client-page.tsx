"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import StatusBadge from "@/components/status-badge";
import type { MomentumDealerLead } from "@/types";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X as XIcon } from "lucide-react";
import { spokeStatuses } from "@/lib/data";

type LeadsClientPageProps = {
    initialLeads: MomentumDealerLead[];
};

export default function LeadsClientPage({ initialLeads }: LeadsClientPageProps) {
  const [leads] = useState(initialLeads);
  const initialFilters = {
    name: "",
    city: "",
    zone: "",
    leadSource: "",
    status: "",
  };
  const [filters, setFilters] = useState(initialFilters);
  
  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', notation: 'compact' }).format(amount);
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-IN');

  const getLatestRemark = (lead: MomentumDealerLead) => {
    if (!lead.remarks || lead.remarks.length === 0) {
      return 'N/A';
    }
    const latestRemark = lead.remarks[lead.remarks.length - 1];
    if (typeof latestRemark === 'object' && latestRemark !== null) {
      return latestRemark.remark || latestRemark.text || 'View Details';
    }
    return 'View Details';
  };

  const handleFilterChange = (filterName: keyof typeof filters, value: string) => {
    setFilters((prev) => ({ ...prev, [filterName]: value }));
  };

  const clearFilters = () => {
    setFilters(initialFilters);
  };
  
  const hasActiveFilters = useMemo(() => {
    return Object.values(filters).some(val => val !== "");
  }, [filters]);

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      return (
        lead.name.toLowerCase().includes(filters.name.toLowerCase()) &&
        lead.city.toLowerCase().includes(filters.city.toLowerCase()) &&
        lead.zone.toLowerCase().includes(filters.zone.toLowerCase()) &&
        lead.leadSource.toLowerCase().includes(filters.leadSource.toLowerCase()) &&
        (filters.status === "" || lead.status === filters.status)
      );
    });
  }, [filters, leads]);


  return (
    <Card>
      <CardHeader>
        <CardTitle>All Momentum Leads</CardTitle>
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
            <Select
              value={filters.status}
              onValueChange={(value) => handleFilterChange("status", value === "all" ? "" : value)}
            >
              <SelectTrigger className="h-9 max-w-48 data-[placeholder]:text-muted-foreground">
                <SelectValue placeholder="Filter by status..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {spokeStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

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
              {filteredLeads.map((lead) => (
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
                  <TableCell className="text-muted-foreground">{getLatestRemark(lead)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
