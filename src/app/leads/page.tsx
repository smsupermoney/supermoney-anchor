
import PageHeader from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getSession } from "@/lib/session";
import { getMomentumDealerLeads } from "@/lib/data";
import { unstable_noStore as noStore } from 'next/cache';
import { Badge } from "@/components/ui/badge";
import StatusBadge from "@/components/status-badge";

export default async function LeadsPage() {
  noStore();
  const session = await getSession();
  const anchorId = session?.roleType === 'Admin' ? undefined : session?.externalId;
  
  const momentumLeads = await getMomentumDealerLeads(anchorId);
  
  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', notation: 'compact' }).format(amount);
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-IN');

  return (
    <>
      <PageHeader title="Leads" />
      <Card>
        <CardHeader>
            <CardTitle>All Momentum Leads</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative w-full overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Zone</TableHead>
                  <TableHead>Lead Source</TableHead>
                  <TableHead>Deal Value</TableHead>
                  <TableHead>Lead Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {momentumLeads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell className="font-medium">{lead.name}</TableCell>
                    <TableCell>{lead.city}</TableCell>
                    <TableCell>{lead.zone}</TableCell>
                    <TableCell>{lead.leadSource}</TableCell>
                    <TableCell>
                        <Badge variant="secondary">{formatCurrency(lead.dealValue * 100000)}</Badge>
                    </TableCell>
                    <TableCell>{formatDate(lead.leadDate)}</TableCell>
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
