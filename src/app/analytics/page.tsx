import PageHeader from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgramPerformanceChart } from "@/components/charts";

export default function AnalyticsPage() {
  return (
    <>
      <PageHeader title="Analytics & Reports" />
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Reporting Stub</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              This section is a placeholder for future reports. Upcoming features will include detailed analysis of interchangeable vs. ring-fenced limit utilization, vendor/dealer performance metrics, and cost of capital trends.
            </p>
          </CardContent>
        </Card>
        <ProgramPerformanceChart />
      </div>
    </>
  );
}
