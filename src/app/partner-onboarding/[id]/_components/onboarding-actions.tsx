
"use client";

import type { OnboardingPartner, User, OnboardingStatus } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import DocumentManager from "./document-manager";
import CreditReportManager from "./credit-report-manager";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

type OnboardingActionsProps = {
  partner: OnboardingPartner;
  user: User;
  onUpdateStatus: (newStatus: OnboardingStatus) => void;
};

export default function OnboardingActions({ partner, user, onUpdateStatus }: OnboardingActionsProps) {
    const renderContent = () => {
        // Salesperson actions
        if (user.role === 'salesperson') {
            switch(partner.status) {
                case 'Pending Document Collection':
                case 'Awaiting Resubmission':
                    return <DocumentManager partner={partner} onUpdateStatus={onUpdateStatus} />;
                default:
                    return <PlaceholderCard title="Awaiting Action" description="The next step is with another team member. You will be notified of any changes." />;
            }
        }
        
        // Regional Manager actions
        if (user.role === 'regional_manager') {
            switch(partner.status) {
                case 'Pending RM Lead Approval':
                    return <ApprovalCard 
                                title="Lead Approval" 
                                description={`Review the new partner lead '${partner.businessName}' for preliminary approval.`}
                                onApprove={() => onUpdateStatus('Pending Document Collection')}
                                onReject={() => onUpdateStatus('Rejected')}
                           />;
                case 'Pending RM Document Validation':
                    return <div className="space-y-6">
                        <DocumentManager partner={partner} onUpdateStatus={onUpdateStatus} isValidator={true} />
                        <CreditReportManager />
                    </div>;
                default:
                    return <PlaceholderCard title="Awaiting Action" description="No pending actions for you on this partner currently." />;
            }
        }

        // HQ Business Review (Supply Chain Head)
        if (user.role === 'supply_chain_head') {
             switch(partner.status) {
                case 'Pending HQ Business Review':
                     return <div className="space-y-6">
                        <ApprovalCard 
                            title="HQ Business Review" 
                            description={`Review the strategic fit of '${partner.businessName}'.`}
                            onApprove={() => onUpdateStatus('Pending HQ Finance Review')}
                            onReject={() => onUpdateStatus('Rejected')}
                        />
                        <CreditReportManager />
                    </div>;
                default:
                    return <PlaceholderCard title="Awaiting Action" description="No pending actions for you on this partner currently." />;
             }
        }
        
        // HQ Finance Review
        if (user.role === 'hq_finance_manager') {
             switch(partner.status) {
                case 'Pending HQ Finance Review':
                     return <div className="space-y-6">
                        <FinanceDecisionCard 
                            onUpdateStatus={onUpdateStatus}
                        />
                        <CreditReportManager />
                     </div>;
                default:
                    return <PlaceholderCard title="Awaiting Action" description="No pending actions for you on this partner currently." />;
             }
        }

        // Default for other roles (e.g. manager, cfo)
        return <PlaceholderCard title="Viewing Partner" description={`You are viewing the onboarding status for ${partner.businessName}.`} />;
    };
    
    return <div className="space-y-6">{renderContent()}</div>;
}


const PlaceholderCard = ({ title, description }: { title: string; description: string }) => (
    <Card>
        <CardHeader>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="h-40 bg-secondary rounded-md flex items-center justify-center">
                <p className="text-muted-foreground text-sm">No actions required at this time.</p>
            </div>
        </CardContent>
    </Card>
);

const ApprovalCard = ({ title, description, onApprove, onReject }: { title: string; description: string; onApprove: () => void; onReject: () => void; }) => (
    <Card>
        <CardHeader>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
             <Textarea placeholder="Add comments (mandatory for rejection)..." />
             <div className="flex justify-end gap-2">
                 <Button variant="destructive" onClick={onReject}>Reject</Button>
                 <Button onClick={onApprove}>Approve</Button>
             </div>
        </CardContent>
    </Card>
);

const FinanceDecisionCard = ({ onUpdateStatus }: { onUpdateStatus: (status: OnboardingStatus) => void; }) => (
    <Card>
        <CardHeader>
            <CardTitle>HQ Finance Review & Final Decision</CardTitle>
            <CardDescription>Make the final commercial decision for this partner.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <RadioGroup defaultValue="scf">
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="trade" id="r1" />
                    <Label htmlFor="r1">Approve for Trade Credit</Label>
                </div>
                 <div className="flex items-center space-x-2">
                    <RadioGroupItem value="scf" id="r2" />
                    <Label htmlFor="r2">Approve for SCF Program</Label>
                </div>
                 <div className="flex items-center space-x-2">
                    <RadioGroupItem value="reject" id="r3" />
                    <Label htmlFor="r3">Reject Partner</Label>
                </div>
            </RadioGroup>
            <Textarea placeholder="Add comments (mandatory for final decision)..." />
            <div className="flex justify-end">
                <Button onClick={() => onUpdateStatus('Active')}>Submit Decision</Button>
            </div>
        </CardContent>
    </Card>
)
