
import PageHeader from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AddAnchorForm from "./add-anchor-form";

export default function AddUserPage() {
  return (
    <>
      <PageHeader title="Add New User" />
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>User Details</CardTitle>
          <CardDescription>
            Enter the details for the new user account.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <AddAnchorForm />
        </CardContent>
      </Card>
    </>
  );
}
