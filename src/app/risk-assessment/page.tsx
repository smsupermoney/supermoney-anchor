import PageHeader from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function RiskAssessmentPage() {
  return (
    <>
      <PageHeader title="AI Risk Assessment" />
        <Card>
          <CardHeader>
            <CardTitle>AI Risk Assessment</CardTitle>
            <CardDescription>This module is currently not in use and has been replaced by newer features.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-60 bg-secondary rounded-md flex items-center justify-center">
              <p className="text-muted-foreground">AI Risk Assessment Placeholder</p>
            </div>
          </CardContent>
        </Card>
    </>
  );
}
