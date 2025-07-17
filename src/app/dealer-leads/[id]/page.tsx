
"use client"

import * as React from 'react';
import PageHeader from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ProgressTracker from "@/components/progress-tracker";
import { dealerLeads, dealerOnboardingStatuses } from "@/lib/data";
import { notFound } from "next/navigation";
import { ArrowLeft, Check, Download, FileText, Send, Upload, FilePlus2, MessageSquare, SendHorizonal, Mail, Phone, X, ThumbsUp, ThumbsDown, Eye, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from '@/context/auth-context';
import type { DealerLead } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import SiteVisitDialog from '@/components/site-visit-dialog';
import CreditCheckDialog from '@/components/credit-check-dialog';
import ApproveLimitDialog from '@/components/approve-limit-dialog';

export default function DealerLeadDetailPage({ params }: { params: { id: string } }) {
    const { user } = useAuth();
    
    const resolvedParams = React.use(params);
    const initialLead = React.useMemo(() => dealerLeads.find(l => l.id === resolvedParams.id), [resolvedParams.id]);

    const [lead, setLead] = React.useState<DealerLead | undefined>(initialLead);
    const [newComment, setNewComment] = React.useState("");
    const [isSiteVisitDialogOpen, setIsSiteVisitDialogOpen] = React.useState(false);
    const [isCreditCheckDialogOpen, setIsCreditCheckDialogOpen] = React.useState(false);
    const [isApproveLimitDialogOpen, setIsApproveLimitDialogOpen] = React.useState(false);

    if (!lead) {
        notFound();
    }
    
    const userSubRole = user?.userSubRole;

    const canValidateLead = userSubRole === 'sales_manager' && lead.status === 'Lead Created';
    const canManageDocs = (userSubRole === 'sales_person' || userSubRole === 'onboarding_ops') && lead.status === 'Lead Verified';
    const canVerifyDocs = (userSubRole === 'onboarding_ops' || userSubRole === 'legal_compliance') && lead.status === 'Documents Collected';
    const canDoSiteVisit = userSubRole === 'field_inspector' && lead.status === 'Documents Verified';
    const canApproveLimit = (userSubRole === 'regional_manager' || userSubRole === 'legal_compliance') && lead.status === 'Site Visit Done';
    const canActivateDealer = userSubRole === 'dealer_admin' && lead.status === 'Business Limit Approved';
    
    const canApproveRejectDocs = userSubRole !== 'sales_manager' && userSubRole !== 'sales_person';


    const handleAddComment = () => {
        if (newComment.trim() && user) {
            const comment = {
                user: user.userName,
                comment: newComment,
                timestamp: new Date().toLocaleString(),
            };
            setLead(prevLead => {
                if (!prevLead) return;
                const updatedComments = [...(prevLead.comments || []), comment];
                return { ...prevLead, comments: updatedComments };
            });
            setNewComment("");
        }
    };
    
    const handleSiteVisitSubmit = (data: { notes: string; images: File[] }) => {
        console.log("Site Visit Report Submitted:", data);
        setLead(prevLead => {
            if (!prevLead) return;
            return {
                ...prevLead,
                status: 'Site Visit Done',
                siteVisitReport: {
                    notes: data.notes,
                    images: data.images.map(f => URL.createObjectURL(f)) 
                }
            };
        });
        setIsSiteVisitDialogOpen(false);
    };
    
    const handleCreditCheckComplete = (score: number) => {
        setLead(prev => prev ? { ...prev, creditCheckScore: score } : undefined);
    };
    
    const handleLimitApproval = (approvedLimit: number) => {
        setLead(prev => {
            if (!prev) return undefined;
            return {
                ...prev,
                approvedLimit: approvedLimit,
                businessLimit: approvedLimit, // Keep this consistent for now
                status: 'Business Limit Approved'
            };
        });
    };

    const formatCurrency = (amount?: number) => {
        if (typeof amount !== 'number') return "N/A";
        return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount);
    };


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
                            {canValidateLead && (
                                <div className="flex gap-4">
                                    <Button><ThumbsUp className="mr-2 h-4 w-4" />Approve</Button>
                                    <Button variant="destructive"><ThumbsDown className="mr-2 h-4 w-4" />Reject</Button>
                                </div>
                            )}
                            {canManageDocs && <p className="text-sm text-muted-foreground">Please upload required documents below.</p>}
                            {canVerifyDocs && <Button><Check className="mr-2 h-4 w-4" />Mark All Documents as Verified</Button>}
                            {canDoSiteVisit && <Button onClick={() => setIsSiteVisitDialogOpen(true)}><Send className="mr-2 h-4 w-4" />Submit Site Visit Report</Button>}
                            {canApproveLimit && (
                                <div className="flex gap-4">
                                    <Button onClick={() => setIsCreditCheckDialogOpen(true)} variant="outline">
                                        <ShieldCheck className="mr-2 h-4 w-4" />Credit Check
                                    </Button>
                                    <Button onClick={() => setIsApproveLimitDialogOpen(true)}><ThumbsUp className="mr-2 h-4 w-4" />Approve</Button>
                                    <Button variant="destructive"><ThumbsDown className="mr-2 h-4 w-4" />Reject</Button>
                                </div>
                            )}
                            {canActivateDealer && (
                                <div className="flex gap-4">
                                    <Button><ThumbsUp className="mr-2 h-4 w-4" />Approve</Button>
                                    <Button variant="destructive"><ThumbsDown className="mr-2 h-4 w-4" />Reject</Button>
                                </div>
                            )}

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
                                                {canApproveRejectDocs && doc.status !== 'Verified' && (
                                                    <>
                                                        <Button variant="outline" size="sm" className='h-8'>
                                                            <ThumbsUp className="mr-2 h-4 w-4 text-green-500" /> Approve
                                                        </Button>
                                                        <Button variant="outline" size="sm" className='h-8'>
                                                            <ThumbsDown className="mr-2 h-4 w-4 text-red-500" /> Reject
                                                        </Button>
                                                    </>
                                                )}
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <Download className="h-4 w-4"/>
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-4">No documents uploaded yet.</p>
                            )}
                            {canManageDocs && (
                                <>
                                    <Separator />
                                    <div className="pt-2 space-y-2">
                                        <p className="text-sm font-medium">Upload New Document</p>
                                        <div className='flex gap-2 items-center'>
                                            <Input type="text" placeholder="Document Name (e.g. Aadhaar Card)" className='h-9'/>
                                            <Input type="file" className="text-xs h-9"/>
                                            <Button size="sm"><Upload className="mr-2 h-4 w-4" />Upload</Button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader>
                            <CardTitle className='flex items-center gap-2'>
                                <MessageSquare className='h-5 w-5 text-primary' />
                                Comments
                            </CardTitle>
                             <CardDescription>View and add comments to this lead's onboarding process.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className='max-h-60 overflow-y-auto border rounded-md'>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className='w-[180px]'>User</TableHead>
                                            <TableHead>Comment</TableHead>
                                            <TableHead className='text-right w-[200px]'>Timestamp</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {lead.comments && lead.comments.length > 0 ? (
                                            lead.comments.map((comment, index) => (
                                                <TableRow key={index}>
                                                    <TableCell className='font-medium'>{comment.user}</TableCell>
                                                    <TableCell className='text-muted-foreground'>{comment.comment}</TableCell>
                                                    <TableCell className='text-right'>{comment.timestamp}</TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={3} className='text-center text-muted-foreground'>No comments yet.</TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                                </div>
                                <div className='space-y-2'>
                                    <Textarea 
                                        placeholder="Add your comment..." 
                                        value={newComment} 
                                        onChange={(e) => setNewComment(e.target.value)}
                                        rows={3}
                                    />
                                    <div className='flex justify-end'>
                                        <Button onClick={handleAddComment} disabled={!newComment.trim()}>
                                            <SendHorizonal className="mr-2 h-4 w-4"/>
                                            Add Comment
                                        </Button>
                                    </div>
                                </div>
                            </div>
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
                             <div className="flex justify-between items-center">
                                <span className="text-muted-foreground flex items-center gap-2"><Mail className="h-3 w-3"/> Email</span>
                                <span className="font-medium">{lead.contactEmail}</span>
                            </div>
                             <Separator />
                             <div className="flex justify-between items-center">
                                <span className="text-muted-foreground flex items-center gap-2"><Phone className="h-3 w-3"/> Phone</span>
                                <span className="font-medium">{lead.contactPhone}</span>
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
                    <Card>
                        <CardHeader>
                            <CardTitle>Financial Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Requested Limit</span>
                                <span className="font-medium">{formatCurrency(lead.requestedLimit)}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Approved Limit</span>
                                <span className="font-medium text-green-600">{formatCurrency(lead.approvedLimit)}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Credit Check Score</span>
                                {lead.creditCheckScore ? (
                                    <span className="font-bold text-lg">{lead.creditCheckScore} <span className='text-xs text-muted-foreground'>/ 10</span></span>
                                ) : (
                                    <Badge variant="outline">Not Done</Badge>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {isSiteVisitDialogOpen && (
                <SiteVisitDialog
                    open={isSiteVisitDialogOpen}
                    onOpenChange={setIsSiteVisitDialogOpen}
                    onSubmit={handleSiteVisitSubmit}
                />
            )}
            
            {isCreditCheckDialogOpen && (
                <CreditCheckDialog
                    open={isCreditCheckDialogOpen}
                    onOpenChange={setIsCreditCheckDialogOpen}
                    onCreditCheckComplete={handleCreditCheckComplete}
                />
            )}
            
            {isApproveLimitDialogOpen && (
                <ApproveLimitDialog
                    open={isApproveLimitDialogOpen}
                    onOpenChange={setIsApproveLimitDialogOpen}
                    onSubmit={handleLimitApproval}
                    requestedLimit={lead.requestedLimit}
                />
            )}
        </>
    );
}
