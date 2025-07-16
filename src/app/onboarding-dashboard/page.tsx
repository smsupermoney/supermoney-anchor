
"use server";

import { getSession } from "@/lib/session";
import { dealerLeads } from "@/lib/data";
import PageHeader from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import StatusBadge from "@/components/status-badge";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { DealerLead, UserSubRole } from "@/types";
import { ArrowRight, Building, CheckSquare, HandCoins, MapPin, UserCheck, Users, PlusCircle, BadgePercent } from "lucide-react";
import { Button } from "@/components/ui/button";

const getActionableLeads = (leads: DealerLead[], userSubRole: UserSubRole | undefined): DealerLead[] => {
  if (!userSubRole) return [];

  switch (userSubRole) {
    case "sales_person":
      return leads.filter(lead => lead.status === 'Documents Collected' || lead.status === 'Lead Created');
    case "sales_manager":
      return leads.filter(lead => lead.status === 'Lead Created');
    case "onboarding_ops":
      return leads.filter(lead => lead.status === 'Documents Collected');
    case "field_inspector":
        return leads.filter(lead => lead.status === 'Documents Verified');
    case "legal_compliance":
      return leads.filter(lead => ['Documents Collected', 'Site Visit Done'].includes(lead.status));
    case "regional_manager":
      return leads.filter(lead => lead.status === 'Site Visit Done');
    case "dealer_admin":
      return leads.filter(lead => lead.status === 'Business Limit Approved');
    default:
      return [];
  }
};

const getRoleBasedStats = (leads: DealerLead[], userSubRole: UserSubRole | undefined) => {
    const totalLeads = leads.length;
    const stats: { title: string; value: number; icon: React.ElementType }[] = [
        { title: "Total Onboarding Leads", value: totalLeads, icon: Users },
    ];
    
    if(!userSubRole) return stats;

    switch (userSubRole) {
        case 'sales_person':
            stats.push({ title: "My Created Leads", value: leads.filter(l => l.createdBy === 'sales_person_1').length, icon: Building });
            stats.push({ title: "Pending My Action", value: getActionableLeads(leads, userSubRole).length, icon: ArrowRight });
            break;
        case 'sales_manager':
            stats.push({ title: "Awaiting Validation", value: leads.filter(l => l.status === 'Lead Created').length, icon: HandCoins });
            stats.push({ title: "Active Onboarding", value: leads.filter(l => l.status !== 'Dealer Activated' && l.status !== 'Onboarding Dropped').length, icon: Users });
            break;
        case 'onboarding_ops':
             stats.push({ title: "Docs to Verify", value: leads.filter(l => l.status === 'Documents Collected').length, icon: CheckSquare });
             break;
        case 'field_inspector':
            stats.push({ title: "Site Visits Assigned", value: leads.filter(l => l.status === 'Documents Verified').length, icon: MapPin });
            break;
        case 'regional_manager':
            stats.push({ title: "Limits to Approve", value: leads.filter(l => l.status === 'Site Visit Done').length, icon: BadgePercent });
            break;
        case 'dealer_admin':
            stats.push({ title: "Dealers to Activate", value: leads.filter(l => l.status === 'Business Limit Approved').length, icon: UserCheck });
            break;
        default:
            break;
    }
    return stats;
}


export default async function OnboardingDashboardPage() {
  const session = await getSession();
  const userSubRole = session?.userSubRole;
  
  const actionableLeads = getActionableLeads(dealerLeads, userSubRole);
  const stats = getRoleBasedStats(dealerLeads, userSubRole);

  const canCreateLead = userSubRole === 'sales_person';

  return (
    <>
      <PageHeader title="Onboarding Dashboard">
        {canCreateLead && (
            <Button asChild>
                <Link href="/add-lead">
                    <PlusCircle className="mr-2 h-4 w-4"/>
                    Add Lead
                </Link>
            </Button>
        )}
      </PageHeader>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-4">
            {stats.map((stat, index) => (
            <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                    <stat.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                </CardContent>
            </Card>
            ))}
      </div>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>My Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative w-full overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Dealer Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Region</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Current Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {actionableLeads.length > 0 ? (
                    actionableLeads.map((lead) => (
                    <TableRow key={lead.id} className="cursor-pointer hover:bg-muted">
                        <TableCell className="font-medium">
                        <Link href={`/dealer-leads/${lead.id}`} className="text-primary hover:underline block">
                            {lead.dealerName}
                        </Link>
                        </TableCell>
                        <TableCell>{lead.location}</TableCell>
                        <TableCell>
                        <Badge variant="secondary">{lead.region}</Badge>
                        </TableCell>
                        <TableCell>{lead.createdAt}</TableCell>
                        <TableCell><StatusBadge status={lead.status} /></TableCell>
                    </TableRow>
                    ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                            No actions required at this time.
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
