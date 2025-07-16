
"use server"

import PageHeader from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { dealerLeads } from "@/lib/data";
import StatusBadge from "@/components/status-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function DealerDocumentsPage() {
    const leadsForVerification = dealerLeads.filter(lead => lead.status === 'Documents Collected' || lead.status === 'Documents Verified');

  return (
    <>
      <PageHeader title="Document Verification" />
      <Card className="mt-4">
        <CardHeader>
            <CardTitle>Pending Verifications</CardTitle>
            <CardDescription>Review and verify documents for onboarding dealers. This includes roles for Onboarding Ops and Legal/Compliance.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="relative w-full overflow-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Dealer Name</TableHead>
                            <TableHead>Documents</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {leadsForVerification.length > 0 ? (
                            leadsForVerification.map(lead => (
                                <TableRow key={lead.id}>
                                    <TableCell className="font-medium">{lead.dealerName}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {lead.documents?.map(doc => (
                                                <Badge key={doc.name} variant={doc.status === 'Verified' ? 'default' : 'secondary'}>{doc.name}</Badge>
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <StatusBadge status={lead.status} />
                                    </TableCell>
                                    <TableCell>
                                        <Button asChild variant="outline" size="sm">
                                            <Link href={`/dealer-leads/${lead.id}`}>View & Verify</Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                             <TableRow>
                                <TableCell colSpan={4} className="text-center text-muted-foreground">
                                    No leads are currently awaiting document verification.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </CardContent>
      </Card>
    </>
  );
}
