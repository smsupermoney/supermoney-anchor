
import PageHeader from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getSession } from "@/lib/session";
import { getAnchorLeads } from "@/lib/data";
import { unstable_noStore as noStore } from 'next/cache';
import { Badge } from "@/components/ui/badge";
import StatusBadge from "@/components/status-badge";

export default async function LeadsPage() {
  noStore();
  const session = await getSession();
  
  const anchorLeads = await getAnchorLeads();

  return (
    <>
      <PageHeader title="Leads" />
      <Card>
        <CardHeader>
            <CardTitle>All Anchor Leads</CardTitle>
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
                  <TableHead>GSTIN</TableHead>
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
                    <TableCell className="font-mono text-xs">{lead.gstin || 'N/A'}</TableCell>
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

