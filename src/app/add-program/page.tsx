
import PageHeader from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AddProgramForm from "./add-program-form";

export default function AddProgramPage() {
  return (
    <>
      <PageHeader title="Add New Programs (Bulk)" />
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Bulk Import Programs</CardTitle>
          <CardDescription>
            Paste a JSON array of program objects into the textarea below. Each object in the array will be added as a new document in the 'programs' collection.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AddProgramForm />
        </CardContent>
      </Card>
    </>
  );
}
