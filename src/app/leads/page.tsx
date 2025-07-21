
import PageHeader from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getSession } from "@/lib/session";
import { collection, getDocs } from "firebase/firestore";
import { db2 } from "@/lib/firebase";
import { unstable_noStore as noStore } from 'next/cache';
import type { AnchorLead } from "@/types";
import { Badge } from "@/components/ui/badge";
import StatusBadge from "@/components/status-badge";

async function getAnchorLeads(): Promise<AnchorLead[]> {
    const anchorCol = collection(db2, 'anchor');
    const anchorSnapshot = await getDocs(anchorCol);
    return anchorSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AnchorLead));
}


export default async function LeadsPage() {
  noStore();
  const session = await getSession();
  const isAdmin = session?.roleType === 'Admin';
  
  const anchorLeads = await getAnchorLeads();

  return (
    <>
      <PageHeader title="Leads" />
      <Card>
        <CardHeader>
            <CardTitle>All Leads</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative w-full overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Annual Turnover</TableHead>
                  <TableHead>Industry</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {anchorLeads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell className="font-medium">{lead.name}</TableCell>
                    <TableCell>{lead.address}</TableCell>
                    <TableCell>
                        <Badge variant="secondary">{lead.annualTurnover}</Badge>
                    </TableCell>
                    <TableCell>{lead.industry}</TableCell>
                    <TableCell>
                        <StatusBadge status={lead.status as any} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
