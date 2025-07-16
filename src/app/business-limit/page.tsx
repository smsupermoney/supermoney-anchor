
import PageHeader from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function BusinessLimitPage() {
  return (
    <>
      <PageHeader title="Business Limit Approval" />
      <Card className="mt-4">
        <CardHeader>
            <CardTitle>Pending Approvals</CardTitle>
            <CardDescription>Review and approve business limits for dealers.</CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground">Business limit approval queue will be displayed here.</p>
        </CardContent>
      </Card>
    </>
  );
}
