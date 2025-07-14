import PageHeader from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <>
      <PageHeader title="Settings" />
      <div className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>User Account</CardTitle>
            <CardDescription>
              Manage your account settings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>User settings form will be here.</p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
