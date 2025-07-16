
import PageHeader from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AddUsersForm from "./add-users-form";

export default function AddUsersPage() {
  return (
    <>
      <PageHeader title="Add Users (JSON)" />
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Bulk Add/Update Users</CardTitle>
          <CardDescription>
            Paste a JSON array of user objects into the textarea below. If a user with the same `id` exists, it will be overwritten.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <AddUsersForm />
        </CardContent>
      </Card>
    </>
  );
}
