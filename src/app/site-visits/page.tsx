
import PageHeader from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SiteVisitsPage() {
  return (
    <>
      <PageHeader title="Site Visit Reports" />
      <Card className="mt-4">
        <CardHeader>
            <CardTitle>Submitted Reports</CardTitle>
            <CardDescription>View and manage site visit reports from field inspectors.</CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground">Site visit reports will be listed here.</p>
        </CardContent>
      </Card>
    </>
  );
}
