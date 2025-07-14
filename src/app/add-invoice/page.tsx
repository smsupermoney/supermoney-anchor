
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function AddInvoicePage() {
  return (
    <>
      <PageHeader title="Add New Invoice">
         <Button asChild variant="outline" size="sm">
            <Link href="/invoices">View All Invoices <ArrowRight className="ml-2 h-4 w-4" /></Link>
        </Button>
      </PageHeader>
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Invoice Details</CardTitle>
          <CardDescription>Fill in the details to manually add a new invoice.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="invoice-number">Invoice Number</Label>
                <Input id="invoice-number" placeholder="e.g., INV-2024-001" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dealer-name">Dealer Name</Label>
                <Select>
                  <SelectTrigger id="dealer-name">
                    <SelectValue placeholder="Select a dealer" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Dealer options would be populated dynamically */}
                    <SelectItem value="dealer1">Star Electronics</SelectItem>
                    <SelectItem value="dealer2">Future Gadgets</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="amount">Amount (INR)</Label>
                    <Input id="amount" type="number" placeholder="e.g., 150000" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="due-date">Due Date</Label>
                    <Input id="due-date" type="date" />
                </div>
            </div>
            <div className="flex justify-end">
                <Button type="submit">Create Invoice</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
