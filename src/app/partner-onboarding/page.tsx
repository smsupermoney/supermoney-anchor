import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";

export default function PartnerOnboardingPage() {
  return (
    <>
      <PageHeader title="Partner Onboarding">
        <Button>
          <PlusCircle className="mr-2" />
          Add New Partner
        </Button>
      </PageHeader>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Onboarding Pipeline</CardTitle>
            <CardDescription>This section will contain a pipeline view of all partners and their current stage in the onboarding process.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-60 bg-secondary rounded-md flex items-center justify-center">
              <p className="text-muted-foreground">Pipeline View Placeholder</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>My Tasks</CardTitle>
             <CardDescription>This section will contain role-based queues for onboarding tasks.</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="h-40 bg-secondary rounded-md flex items-center justify-center">
              <p className="text-muted-foreground">Task Queue Placeholder</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
