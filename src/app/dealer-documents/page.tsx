
import PageHeader from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DealerDocumentsPage() {
  return (
    <>
      <PageHeader title="Document Verification" />
      <Card className="mt-4">
        <CardHeader>
            <CardTitle>Pending Verifications</CardTitle>
            <CardDescription>Review and verify documents for onboarding dealers.</CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground">Document verification dashboard will be displayed here.</p>
        </CardContent>
      </Card>
    </>
  );
}
