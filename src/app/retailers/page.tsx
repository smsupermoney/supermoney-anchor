import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { vendors } from "@/lib/data";
import { PlusCircle } from "lucide-react";
import StatusBadge from "@/components/status-badge";

export default function DealersPage() {
  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

  return (
    <>
      <PageHeader title="Vendors">
        <Button>
          <PlusCircle className="mr-2" />
          Onboard Vendor
        </Button>
      </PageHeader>
      <Card>
        <CardHeader>
            <CardTitle>All Vendors</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vendor Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Outstanding Amount</TableHead>
                <TableHead>Credit Rating</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vendors.map((vendor) => (
                <TableRow key={vendor.id}>
                  <TableCell className="font-medium">{vendor.name}</TableCell>
                  <TableCell><StatusBadge status={vendor.kycStatus} /></TableCell>
                   <TableCell>{vendor.category}</TableCell>
                  <TableCell className="text-right">{formatCurrency(vendor.outstandingAmount)}</TableCell>
                  <TableCell>{vendor.creditRating}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
