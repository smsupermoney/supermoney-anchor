
import PageHeader from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AddDealerLimitForm from "./add-dealer-limit-form";

export default function AddDealerLimitPage() {
  return (
    <>
      <PageHeader title="Add Dealer Limits (Bulk)" />
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Bulk Import Dealer-Program Limits</CardTitle>
          <CardDescription>
            Paste a JSON array of limit objects below. Each object will be added as a new document in the 'dealerProgramLimits' collection.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AddDealerLimitForm />
        </CardContent>
      </Card>
    </>
  );
}
