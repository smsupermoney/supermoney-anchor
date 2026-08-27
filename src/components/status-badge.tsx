import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { InvoiceStatus, LeadStatus, Retailer, DealerOnboardingStatus, RepaymentStatus } from "@/types";
import { CheckCircle2 } from "lucide-react";

type Status = Retailer['status'] | InvoiceStatus | LeadStatus | DealerOnboardingStatus | RepaymentStatus | string;

type StatusBadgeProps = {
  status: Status;
  className?: string;
};

const statusColors: Record<Status, string> = {
  // Retailer Status
  'Active': 'bg-green-100 text-green-800 border-green-200',
  'Inactive': 'bg-gray-100 text-gray-800 border-gray-200',
  'Pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'Supply Stopped': 'bg-red-200 text-red-900 border-red-300',

  // Invoice Status
  'Initiated': 'bg-blue-100 text-blue-800 border-blue-200',
  'Approved': 'bg-sky-100 text-sky-800 border-sky-200',
  'Sent to Lender': 'bg-indigo-100 text-indigo-800 border-indigo-200',
  'Disbursed': 'bg-green-100 text-green-800 border-green-200',
  'Rejected': 'bg-red-100 text-red-800 border-red-200',
  'Repaid': 'bg-emerald-100 text-emerald-800 border-emerald-200',
  'Consent Approved': 'bg-teal-100 text-teal-800 border-teal-200',
  
  // Lead Status
  'Lead Created': 'bg-blue-100 text-blue-800 border-blue-200',
  'Registered': 'bg-purple-100 text-purple-800 border-purple-200',
  'KYC': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'Credit': 'bg-orange-100 text-orange-800 border-orange-200',
  'Operations': 'bg-teal-100 text-teal-800 border-teal-200',
  'PSD Completed': 'bg-green-100 text-green-800 border-green-200',
  'Dropped': 'bg-red-100 text-red-800 border-red-200',
  'Follow up': 'bg-blue-100 text-blue-800 border-blue-200',
  
  // Dealer Onboarding Status
  'Lead Verified': 'bg-purple-100 text-purple-800 border-purple-200',
  'Documents Collected': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'Documents Verified': 'bg-sky-100 text-sky-800 border-sky-200',
  'Site Visit Done': 'bg-teal-100 text-teal-800 border-teal-200',
  'Business Limit Approved': 'bg-indigo-100 text-indigo-800 border-indigo-200',
  'Dealer Activated': 'bg-green-100 text-green-800 border-green-200',
  'Onboarding Dropped': 'bg-red-100 text-red-800 border-red-200',

  // Repayment Status
  'Link Sent': 'bg-blue-100 text-blue-800 border-blue-200',
  'Partially Paid': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'Paid': 'bg-green-100 text-green-800 border-green-200',
  'Failed': 'bg-red-100 text-red-800 border-red-200',
};

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const isDisbursed = status === 'Disbursed';

  return (
    <Badge
      className={cn(
        "font-medium capitalize",
        statusColors[status] || 'bg-gray-100 text-gray-800 border-gray-200',
        isDisbursed && "flex items-center gap-1",
        className
      )}
    >
      {isDisbursed && <CheckCircle2 className="h-3 w-3" />}
      {status}
    </Badge>
  );
}