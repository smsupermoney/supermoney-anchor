import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { dealers } from "@/lib/data";
import { PlusCircle } from "lucide-react";
import StatusBadge from "@/components/status-badge";

export default function DealersPage() {
  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

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
              {dealers.map((dealer) => (
                <TableRow key={dealer.id}>
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
    </>
  );
}
