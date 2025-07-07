import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { InvoiceStatus, LeadStatus, Retailer } from "@/types";

type Status = Retailer['status'] | InvoiceStatus | LeadStatus;

type StatusBadgeProps = {
  status: Status;
  className?: string;
};

const statusColors: Record<Status, string> = {
  // Retailer Status
  'Active': 'bg-green-100 text-green-800 border-green-200',
  'Inactive': 'bg-gray-100 text-gray-800 border-gray-200',
  'Pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',

  // Invoice Status
  'Initiated': 'bg-blue-100 text-blue-800 border-blue-200',
  'Approved': 'bg-sky-100 text-sky-800 border-sky-200',
  'Sent to Lender': 'bg-indigo-100 text-indigo-800 border-indigo-200',
  'Disbursed': 'bg-green-100 text-green-800 border-green-200',
  'Rejected': 'bg-red-100 text-red-800 border-red-200',
  
  // Lead Status
  'Lead Created': 'bg-blue-100 text-blue-800 border-blue-200',
  'Registered': 'bg-purple-100 text-purple-800 border-purple-200',
  'KYC': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'Credit': 'bg-orange-100 text-orange-800 border-orange-200',
  'Operations': 'bg-teal-100 text-teal-800 border-teal-200',
  'PSD Completed': 'bg-green-100 text-green-800 border-green-200',
  'Dropped': 'bg-red-100 text-red-800 border-red-200',
};

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge
      className={cn(
        "font-medium capitalize",
        statusColors[status] || 'bg-gray-100 text-gray-800 border-gray-200',
        className
      )}
    >
      {status}
    </Badge>
  );
}
