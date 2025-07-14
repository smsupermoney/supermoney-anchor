
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function AddProgramPage() {
  return (
    <>
      <PageHeader title="Add New Program">
        <Button asChild variant="outline" size="sm">
            <Link href="/programs">View All Programs <ArrowRight className="ml-2 h-4 w-4" /></Link>
        </Button>
      </PageHeader>
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Program Details</CardTitle>
          <CardDescription>Fill in the details to create a new lender program.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lender-name">Lender Name</Label>
                <Input id="lender-name" placeholder="e.g., Supermoney Finance" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lender-type">Lender Type</Label>
                <Select>
                  <SelectTrigger id="lender-type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Supermoney">Supermoney</SelectItem>
                    <SelectItem value="External">External</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
             <div className="space-y-2">
              <Label htmlFor="total-limit">Total Limit (INR)</Label>
              <Input id="total-limit" type="number" placeholder="e.g., 5000000" />
            </div>
            <div className="flex justify-end">
                <Button type="submit">Create Program</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
