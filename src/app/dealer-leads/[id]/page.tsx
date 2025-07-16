
"use server"

import PageHeader from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ProgressTracker from "@/components/progress-tracker";
import { dealerLeads, dealerOnboardingStatuses } from "@/lib/data";
import { notFound } from "next/navigation";
import { ArrowLeft, Check, Download, FileText, Send, Upload, FilePlus2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/session";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default async function DealerLeadDetailPage({ params }: { params: { id: string } }) {
    const lead = dealerLeads.find(l => l.id === params.id);
    const session = await getSession();
    const userSubRole = session?.userSubRole;

    if (!lead) {
        notFound();
    }
    
    const canValidateLead = userSubRole === 'sales_manager' && lead.status === 'Lead Created';
    const canManageDocs = (userSubRole === 'sales_person' || userSubRole === 'onboarding_ops') && lead.status === 'Lead Verified';
    const canVerifyDocs = (userSubRole === 'onboarding_ops' || userSubRole === 'legal_compliance') && lead.status === 'Documents Collected';
    const canDoSiteVisit = userSubRole === 'field_inspector' && lead.status === 'Documents Verified';
    const canApproveLimit = (userSubRole === 'regional_manager' || userSubRole === 'legal_compliance') && lead.status === 'Site Visit Done';
    const canActivateDealer = userSubRole === 'dealer_admin' && lead.status === 'Business Limit Approved';

    const getActionTitle = () => {
        if (canValidateLead) return "Validate Lead";
        if (canManageDocs) return "Collect Documents";
        if (canVerifyDocs) return "Verify Documents";
        if (canDoSiteVisit) return "Perform Site Visit";
        if (canApproveLimit) return "Approve Business Limit";
        if (canActivateDealer) return "Activate Dealer";
        return "Lead Details";
    }

    return (
        <>
            <PageHeader title={lead.dealerName}>
                <Button variant="outline" asChild>
                    <Link href="/onboarding-dashboard">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Dashboard
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
                            <CardTitle>Actions</CardTitle>
                            <CardDescription>Perform the required action for this stage of onboarding.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {canValidateLead && <Button><Check className="mr-2 h-4 w-4" />Validate & Move to Next Step</Button>}
                            {canManageDocs && <p className="text-sm text-muted-foreground">Please upload required documents below.</p>}
                            {canVerifyDocs && <Button><Check className="mr-2 h-4 w-4" />Mark All Documents as Verified</Button>}
                            {canDoSiteVisit && <Button><Send className="mr-2 h-4 w-4" />Submit Site Visit Report</Button>}
                            {canApproveLimit && <Button><Check className="mr-2 h-4 w-4" />Approve Limit & Send for Activation</Button>}
                            {canActivateDealer && <Button><Check className="mr-2 h-4 w-4" />Generate Code & Activate Dealer</Button>}

                            {!canValidateLead && !canManageDocs && !canVerifyDocs && !canDoSiteVisit && !canApproveLimit && !canActivateDealer && (
                                <p className="text-sm text-muted-foreground">No actions available for you at this stage.</p>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Documents</CardTitle>
                                <CardDescription>Manage and review uploaded documents.</CardDescription>
                            </div>
                            {canManageDocs && <Button variant="outline" size="sm"><FilePlus2 className="mr-2 h-4 w-4"/>Upload</Button>}
                        </CardHeader>
                        <CardContent className="space-y-3">
                           {lead.documents && lead.documents.length > 0 ? (
                                <div className="space-y-2">
                                    {lead.documents.map((doc, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 bg-secondary rounded-md">
                                            <div className="flex items-center gap-3">
                                                <FileText className="h-5 w-5 text-muted-foreground"/>
                                                <div>
                                                    <span className="font-medium text-sm">{doc.name}</span>
                                                    {doc.status && <Badge variant={doc.status === 'Verified' ? 'default' : 'secondary'} className="ml-2 text-xs">{doc.status}</Badge>}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {canVerifyDocs && <Button variant="ghost" size="sm">Verify</Button>}
                                                <Button variant="ghost" size="sm"><Download className="mr-2 h-4 w-4"/>Download</Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-4">No documents uploaded yet.</p>
                            )}
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
                             <Separator />
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Business Type</span>
                                <span className="font-medium">{lead.businessType}</span>
                            </div>
                             <Separator />
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Location</span>
                                <span className="font-medium">{lead.location}</span>
                            </div>
                             <Separator />
                             <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Region</span>
                                <span className="font-medium"><Badge variant="secondary">{lead.region}</Badge></span>
                            </div>
                             <Separator />
                             <div className="flex justify-between">
                                <span className="text-muted-foreground">Created By</span>
                                <span className="font-medium">{lead.createdBy}</span>
                            </div>
                             <Separator />
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
