
import PageHeader from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AddAnchorForm from "./add-anchor-form";

export default function AddAnchorPage() {
  return (
    <>
      <PageHeader title="Add New Anchor" />
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Anchor Details</CardTitle>
          <CardDescription>
            Enter the details for the new anchor user. An anchor is typically a large enterprise in the supply chain.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <AddAnchorForm />
        </CardContent>
      </Card>
    </>
  );
}
