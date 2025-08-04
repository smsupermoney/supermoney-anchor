
import PageHeader from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ReportsPage() {
  return (
    <>
      <PageHeader title="Reports" />
      <div className="mt-4 flex items-center justify-center">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle>Reports Under Construction</CardTitle>
            <CardDescription>
              This section is currently being developed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground">
              Reports will come here.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
