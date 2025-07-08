
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { InvoiceStatus, VendorKycStatus, OnboardingStatus } from "@/types";

type Status = VendorKycStatus | InvoiceStatus | OnboardingStatus;

type StatusBadgeProps = {
  status: Status;
  className?: string;
};

const statusColors: Record<string, string> = {
  // Vendor KYC Status
  'approved': 'bg-green-100 text-green-800 border-green-200',
  'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  
  // Invoice Status
  'Draft': 'bg-gray-100 text-gray-800 border-gray-200',
  'Submitted': 'bg-blue-100 text-blue-800 border-blue-200',
  'Approved': 'bg-sky-100 text-sky-800 border-sky-200',
  'Financed': 'bg-indigo-100 text-indigo-800 border-indigo-200',
  'Paid': 'bg-green-100 text-green-800 border-green-200',
  'Disputed': 'bg-orange-100 text-orange-800 border-orange-200',
  'Overdue': 'bg-red-100 text-red-800 border-red-200',

  // Onboarding Status
  'Pending RM Lead Approval': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'Pending Document Collection': 'bg-blue-100 text-blue-800 border-blue-200',
  'Pending RM Document Validation': 'bg-cyan-100 text-cyan-800 border-cyan-200',
  'Awaiting Resubmission': 'bg-orange-100 text-orange-800 border-orange-200',
  'Pending HQ Business Review': 'bg-purple-100 text-purple-800 border-purple-200',
  'Pending HQ Finance Review': 'bg-indigo-100 text-indigo-800 border-indigo-200',
  'Active': 'bg-green-100 text-green-800 border-green-200',
  'Rejected': 'bg-red-100 text-red-800 border-red-200',
};

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge
      className={cn(
        "font-medium",
        statusColors[status] || 'bg-gray-100 text-gray-800 border-gray-200',
        className
      )}
    >
      {status}
    </Badge>
  );
}
