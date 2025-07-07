import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { retailers } from "@/lib/data";
import { PlusCircle } from "lucide-react";
import StatusBadge from "@/components/status-badge";

export default function RetailersPage() {
  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

  return (
    <>
      <PageHeader title="Retailers">
        <Button>
          <PlusCircle className="mr-2" />
          Add Retailer
        </Button>
      </PageHeader>
      <Card>
        <CardHeader>
            <CardTitle>All Retailers</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Retailer Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Credit Assigned</TableHead>
                <TableHead className="text-right">Invoices</TableHead>
                <TableHead className="text-right">Amount Disbursed</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {retailers.map((retailer) => (
                <TableRow key={retailer.id}>
                  <TableCell className="font-medium">{retailer.name}</TableCell>
                  <TableCell><StatusBadge status={retailer.status} /></TableCell>
                  <TableCell className="text-right">{formatCurrency(retailer.creditAssigned)}</TableCell>
                  <TableCell className="text-right">{retailer.invoicesSubmitted}</TableCell>
                  <TableCell className="text-right">{formatCurrency(retailer.amountDisbursed)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
