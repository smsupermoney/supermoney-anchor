
import PageHeader from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AddDealerForm from "./add-dealer-form";

export default function AddDealerPage() {
  return (
    <>
      <PageHeader title="Add New Dealers (Bulk)" />
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Bulk Import Dealers</CardTitle>
          <CardDescription>
            Paste a JSON array of dealer objects into the textarea below. Each object will be added as a new document in the 'dealers' collection.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <AddDealerForm />
        </CardContent>
      </Card>
    </>
  );
}
