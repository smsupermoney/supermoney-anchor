
import PageHeader from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AddAnchorForm from "./add-anchor-form";

export default function AddAnchorPage() {
  return (
    <>
      <PageHeader title="Add New Anchors (Bulk)" />
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Bulk Import Anchors</CardTitle>
          <CardDescription>
            Paste a JSON array of anchor user objects into the textarea below. Each object will be added as a new document in the 'users' collection with roleType 'Anchor'.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <AddAnchorForm />
        </CardContent>
      </Card>
    </>
  );
}
