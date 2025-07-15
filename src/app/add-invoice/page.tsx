
import PageHeader from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AddInvoiceForm from "./add-invoice-form";

export default function AddInvoicePage() {
  return (
    <>
      <PageHeader title="Add New Invoices (Bulk)" />
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Bulk Import Invoices</CardTitle>
          <CardDescription>
            Paste a JSON array of invoice objects into the textarea below. Each object will be added as a new document in the 'invoices' collection.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <AddInvoiceForm />
        </CardContent>
      </Card>
    </>
  );
}
