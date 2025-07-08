
export type VendorKycStatus = 'approved' | 'pending' | 'rejected';

export type Vendor = {
  id: string;
  name: string;
  kycStatus: VendorKycStatus;
  category: string;
  outstandingAmount: number;
  creditRating: string;
};

export type Dealer = {
  id: string;
  name: string;
  status: 'Active' | 'Inactive' | 'Pending';
  creditAssigned: number;
  invoicesSubmitted: number;
  amountDisbursed: number;
};

export type InvoiceStatus = 'Draft' | 'Submitted' | 'Approved' | 'Financed' | 'Paid' | 'Disputed' | 'Overdue';

export type Invoice = {
  id: string;
  invoiceNumber: string;
  vendorName?: string;
  dealerName?: string;
  programId: string;
  programType: 'Payables' | 'Receivables';
  amount: number;
  invoiceDate: string;
  dueDate: string;
  status: InvoiceStatus;
};

export type Program = {
  id:string;
  name: 'Vendor Financing' | 'Dealer Financing';
  limit: number | null; // Null for fungible, number for ring-fenced
  interestRate: number; // as APR percentage
};

export type Lender = {
  id: string;
  name: string;
  rmContact?: string;
  sanctionLetterRef?: string;
  limitType: 'Fungible' | 'Ring-fenced';
  totalLimit: number;
  programs: Program[];
};

export type LeadStatus = 'Lead Created' | 'Registered' | 'KYC' | 'Credit' | 'Operations' | 'PSD Completed' | 'Dropped';

export type Lead = {
  id: string;
  dealerName: string;
  contactPerson: string;
  contactEmail: string;
  status: LeadStatus;
  createdAt: string;
};

export type OnboardingStatus = 
  | 'Pending RM Lead Approval' 
  | 'Pending Document Collection' 
  | 'Pending RM Document Validation' 
  | 'Awaiting Resubmission' 
  | 'Pending HQ Business Review' 
  | 'Pending HQ Finance Review' 
  | 'Active' 
  | 'Rejected';

export type OnboardingPartner = {
  id: string;
  partnerType: 'Vendor' | 'Dealer' | 'Distributor';
  businessName: string;
  contactPerson: string;
  mobile: string;
  email: string;
  city: string;
  state: string;
  assignedRM: string;
  salespersonRemarks?: string;
  status: OnboardingStatus;
};
