
"use server"

import PageHeader from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ProgressTracker from "@/components/progress-tracker";
import { dealerLeads, dealerOnboardingStatuses } from "@/lib/data";
import { notFound } from "next/navigation";
import { ArrowLeft, Check, Send } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function DealerLeadDetailPage({ params }: { params: { id: string } }) {
    const lead = dealerLeads.find(l => l.id === params.id);

    if (!lead) {
        notFound();
    }
    
    // In a real app, this would be based on the user's role
    const canValidateLead = lead.status === 'Lead Created';
    const canApproveLimit = lead.status === 'Site Visit Done';
    const canActivateDealer = lead.status === 'Business Limit Approved';

    const getActionTitle = () => {
        if (canValidateLead) return "Validate Lead";
        if (canApproveLimit) return "Approve Business Limit";
        if (canActivateDealer) return "Activate Dealer";
        return "Actions";
    }

    return (
        <>
            <PageHeader title={lead.dealerName}>
                <Button variant="outline" asChild>
                    <Link href="/dealer-leads">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Leads
                    </Link>
                </Button>
            </PageHeader>

            <Card className="mt-4">
                <CardHeader>
                    <CardTitle>Onboarding Progress</CardTitle>
                </CardHeader>
                <CardContent>
                    <ProgressTracker steps={dealerOnboardingStatuses} currentStep={lead.status} />
                </CardContent>
            </Card>

            <div className="grid md:grid-cols-3 gap-6 mt-6">
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>{getActionTitle()}</CardTitle>
                            <CardDescription>Review the details and take the next step.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">Action form will go here based on role and status.</p>
                        </CardContent>
                        <CardContent>
                            {canValidateLead && <Button><Check className="mr-2 h-4 w-4" />Validate Lead</Button>}
                            {canApproveLimit && <Button><Send className="mr-2 h-4 w-4" />Send for Approval</Button>}
                            {canActivateDealer && <Button><Check className="mr-2 h-4 w-4" />Finalize Activation</Button>}
                        </CardContent>
                    </Card>
                </div>
                <div className="md:col-span-1 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Lead Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Contact Person</span>
                                <span className="font-medium">{lead.contactPerson}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Business Type</span>
                                <span className="font-medium">{lead.businessType}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Location</span>
                                <span className="font-medium">{lead.location}</span>
                            </div>
                             <div className="flex justify-between">
                                <span className="text-muted-foreground">Region</span>
                                <span className="font-medium">{lead.region}</span>
                            </div>
                             <div className="flex justify-between">
                                <span className="text-muted-foreground">Created By</span>
                                <span className="font-medium">{lead.createdBy}</span>
                            </div>
                             <div className="flex justify-between">
                                <span className="text-muted-foreground">Created At</span>
                                <span className="font-medium">{lead.createdAt}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
