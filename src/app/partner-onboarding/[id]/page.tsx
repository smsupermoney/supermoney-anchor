
"use client"

import { notFound, useRouter, useParams } from "next/navigation";
import PageHeader from "@/components/page-header";
import ProgressTracker from "@/components/progress-tracker";
import { onboardingPartners, onboardingStatuses } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit } from "lucide-react";
import PartnerDetailsCard from "./_components/partner-details-card";
import OnboardingActions from "./_components/onboarding-actions";
import { useAuth } from "@/contexts/auth-context";

export default function PartnerDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { user } = useAuth();
  const { id } = params;
  const partner = onboardingPartners.find(p => p.id === id);

  if (!partner || !user) {
    notFound();
  }

  // A simple state update simulation
  const handleUpdateStatus = (newStatus: typeof partner.status) => {
    // In a real app, this would be a server action.
    // For now, we just log it and show an alert.
    console.log(`Updating status for ${partner.businessName} to ${newStatus}`);
    alert(`Status updated to: ${newStatus}\n\n(This is a simulation. The page will not reflect the change on refresh.)`);
  };

  return (
    <>
      <PageHeader title={partner.businessName}>
        <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.back()}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to List
            </Button>
            <Button>
                <Edit className="mr-2 h-4 w-4" /> Edit
            </Button>
        </div>
      </PageHeader>
      
      <div className="my-6">
        <ProgressTracker steps={onboardingStatuses} currentStep={partner.status} />
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <PartnerDetailsCard partner={partner} />
        </div>
        <div className="md:col-span-2">
          <OnboardingActions partner={partner} user={user} onUpdateStatus={handleUpdateStatus} />
        </div>
      </div>
    </>
  );
}
