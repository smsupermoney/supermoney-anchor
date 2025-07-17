
"use server"

import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle } from "lucide-react";
import StatusBadge from "@/components/status-badge";
import { getSession } from "@/lib/session";
import { dealerLeads } from "@/lib/data";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default async function DealerLeadsPage() {
  const session = await getSession();
  const userSubRole = session?.userSubRole;

  const canCreateLead = userSubRole === 'sales_person';

  // In a real app, you would fetch data based on user role
  const leads = dealerLeads;

  return (
    <>
      <PageHeader title="Dealer Onboarding Leads">
        {canCreateLead && (
          <Button asChild>
            <Link href="/add-lead">
                <PlusCircle className="mr-2 h-4 w-4"/>
                Add Lead
            </Link>
          </Button>
        )}
      </PageHeader>
      <Card className="mt-4">
        <CardHeader>
            <CardTitle>All Onboarding Leads</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative w-full overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Dealer Name</TableHead>
                  <TableHead>Contact Person</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Region</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.map((lead) => (
                  <TableRow key={lead.id} className="cursor-pointer hover:bg-muted">
                    <TableCell className="font-medium">
                      <Link href={`/dealer-leads/${lead.id}`} className="text-primary hover:underline">
                        {lead.dealerName}
                      </Link>
                    </TableCell>
                    <TableCell>
                        <div>{lead.contactPerson}</div>
                        <div className="text-xs text-muted-foreground">{lead.contactPhone}</div>
                    </TableCell>
                    <TableCell>{lead.location}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{lead.region}</Badge>
                    </TableCell>
                    <TableCell>{lead.createdAt}</TableCell>
                    <TableCell><StatusBadge status={lead.status} /></TableCell>
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

