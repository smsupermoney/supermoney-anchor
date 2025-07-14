
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function AddDealerPage() {
  return (
    <>
      <PageHeader title="Add New Dealer">
        <Button asChild variant="outline" size="sm">
            <Link href="/retailers">View All Dealers <ArrowRight className="ml-2 h-4 w-4" /></Link>
        </Button>
      </PageHeader>
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Dealer Details</CardTitle>
          <CardDescription>Fill in the details to onboard a new dealer.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-6">
            <div className="space-y-2">
              <Label htmlFor="dealer-name">Dealer Name</Label>
              <Input id="dealer-name" placeholder="e.g., Global Electronics" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-person">Contact Person</Label>
              <Input id="contact-person" placeholder="e.g., John Smith" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-email">Contact Email</Label>
              <Input id="contact-email" type="email" placeholder="e.g., john.smith@example.com" />
            </div>
            <div className="flex justify-end">
                <Button type="submit">Create Dealer</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
