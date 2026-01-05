
import PageHeader from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AddDealerLimitForm from "./add-dealer-limit-form";
import { sampleUpcomingPayments } from "@/lib/dummy-data";
import { ScrollArea } from "@/components/ui/scroll-area";
import CopyButton from "./copy-button";

export default function AddUpcomingPaymentsPage() {
  const sampleJson = JSON.stringify(sampleUpcomingPayments, null, 2);

  return (
    <>
      <PageHeader title="Add Upcoming Payments (JSON)" />
      <div className="grid md:grid-cols-2 gap-4 mt-4">
        <Card>
            <CardHeader>
                <CardTitle>Bulk Add/Update Upcoming Payments</CardTitle>
                <CardDescription>
                    Paste a JSON array of upcoming payment objects. If a payment with the same `id` exists, it will be overwritten.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <AddDealerLimitForm />
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle className="flex justify-between items-center">
                    Sample JSON
                    <CopyButton text={sampleJson} />
                </CardTitle>
                <CardDescription>
                    You can use this sample data to test the upload functionality.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-96 w-full rounded-md border">
                    <pre className="p-4 text-xs">{sampleJson}</pre>
                </ScrollArea>
            </CardContent>
        </Card>
      </div>
    </>
  );
}
