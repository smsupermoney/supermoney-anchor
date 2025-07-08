
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import StatusBadge from "@/components/status-badge";
import type { OnboardingPartner } from "@/types";
import { Building, User, Mail, Phone, MapPin, UserCheck, MessageSquare } from "lucide-react";

export default function PartnerDetailsCard({ partner }: { partner: OnboardingPartner }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle className="flex items-center gap-2"><Building className="h-5 w-5 text-primary" />{partner.partnerType}</CardTitle>
                <CardDescription>{partner.businessName}</CardDescription>
            </div>
            <StatusBadge status={partner.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <Separator />
        <div className="space-y-2">
             <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>{partner.contactPerson}</span>
            </div>
             <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{partner.email}</span>
            </div>
             <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{partner.mobile}</span>
            </div>
             <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{partner.city}, {partner.state}</span>
            </div>
        </div>
        <Separator />
         <div className="space-y-2">
             <div className="flex items-center gap-3">
                <UserCheck className="h-4 w-4 text-muted-foreground" />
                <span>Assigned RM: {partner.assignedRM}</span>
            </div>
            {partner.salespersonRemarks && (
                <div className="flex items-start gap-3">
                    <MessageSquare className="h-4 w-4 text-muted-foreground mt-1" />
                    <p className="text-muted-foreground italic text-xs">"{partner.salespersonRemarks}"</p>
                </div>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
