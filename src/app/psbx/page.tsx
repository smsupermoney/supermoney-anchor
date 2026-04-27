import { unstable_noStore as noStore } from 'next/cache';
import PageHeader from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getPrograms } from "@/lib/data";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import PsbxTable from "./psbx-table";

export default async function PsbxManagementPage() {
  noStore();
  const session = await getSession();

  if (session?.roleType !== 'Admin') {
    redirect('/dashboard');
  }

  const { programs } = await getPrograms();

  return (
    <>
      <PageHeader title="PSBX Configuration" />
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>PSBX Program Toggles</CardTitle>
          <CardDescription>
            Enable or disable real-time PSBX limit fetching and validation for specific financing programs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PsbxTable initialPrograms={programs} />
        </CardContent>
      </Card>
    </>
  );
}
