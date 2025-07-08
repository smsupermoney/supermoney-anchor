import PageHeader from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function LeadsPage() {
  return (
    <>
      <PageHeader title="Leads" />
        <Card>
          <CardHeader>
            <CardTitle>Leads Module</CardTitle>
            <CardDescription>This module is currently not in use and will be replaced by the Partner Onboarding workflow.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-60 bg-secondary rounded-md flex items-center justify-center">
              <p className="text-muted-foreground">Leads Placeholder</p>
            </div>
          </CardContent>
        </Card>
    </>
  );
}
