
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { getSession } from '@/lib/session';

export default async function AddLeadPage() {
  const session = await getSession();

  return (
    <>
      <PageHeader title="Add New Lead">
        <Button asChild variant="outline" size="sm">
            <Link href="/leads">View All Leads <ArrowRight className="ml-2 h-4 w-4" /></Link>
        </Button>
      </PageHeader>
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Lead Details</CardTitle>
          <CardDescription>Enter the information for a new dealer lead.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-6">
            <div className="space-y-2">
              <Label htmlFor="dealer-name">Dealer Name</Label>
              <Input id="dealer-name" placeholder="e.g., NextGen Retail" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-person">Contact Person</Label>
              <Input id="contact-person" placeholder="e.g., Jane Doe" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-email">Contact Email</Label>
              <Input id="contact-email" type="email" placeholder="e.g., jane.doe@example.com" />
            </div>
             <div className="space-y-2">
              <Label htmlFor="contact-phone">Contact Phone</Label>
              <Input id="contact-phone" type="tel" placeholder="e.g., 9876543210" />
            </div>
            <div className="flex justify-end">
                <Button type="submit">Create Lead</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
