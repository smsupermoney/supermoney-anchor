import PageHeader from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  return (
    <>
      <PageHeader title="Settings" />
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Lender Configuration</CardTitle>
            <CardDescription>
              Add or edit lender details and their financing limits.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center p-4 border rounded-lg">
                <p>Manage your financing partners.</p>
                <Button>Add New Lender</Button>
            </div>
            <div className="h-40 bg-secondary rounded-md flex items-center justify-center mt-4">
              <p className="text-muted-foreground">Lender List Placeholder</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Audit Trail</CardTitle>
            <CardDescription>
              This section will contain a log of all critical actions taken within the application for compliance and security.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-60 bg-secondary rounded-md flex items-center justify-center">
              <p className="text-muted-foreground">Audit Log Placeholder</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
