

export type UserRole = "Anchor" | "SuperMoney User" | "Admin";

export type Dealer = {
  id: string; // This is the dealerId (e.g. DLR001)
  name: string;
  anchorId: string;
  anchorName?: string;
  status: 'Active' | 'Inactive' | 'Pending';
  lenders: string[];
  invoicesSubmitted: number;
  amountDisbursed: number;
  overdueCount: number;
  overdueAmount: number;
  programId?: string; 
};

export type InvoiceStatus = 'Initiated' | 'Approved' | 'Sent to Lender' | 'Disbursed' | 'Rejected';

export type Invoice = {
  id: string;
  invoiceNumber: string;
  programId: string;
  dealerId: string;
  anchorId: string;
  date: string;
  dueDate: string;
  amount: number;
  disbursementSentAmount: number;
  status: InvoiceStatus;
  remarks: string;
  utrNo: string;
  // Fields below are dynamically added and not in DB
  dealerName: string; 
  lender: string;
  overdueAmount?: number;
  anchorName?: string;
};


export type Program = {
  id: string; // This is the programId (e.g. PROG001)
  programId: string; // The business key
  lenderName: string;
  lenderType: 'Supermoney' | 'External';
  totalLimit?: number;
  usedLimit?: number;
  invoicesCount?: number;
  disbursedAmount?: number;
  totalDealers?: number;
  overdueCount?: number;
  pendingInvoicesCount?: number;
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

export type UserSubRole = 
  | "Manager" 
  | "Viewer"
  | "Field Sales"
  | "AP/AR Approver"
  | "Executive"
  | "Business Lead"
  | "Auditor"
  | "Super Admin"
  | "Not Subscribed"
  // Dealer Onboarding Roles
  | "sales_person"
  | "sales_manager"
  | "onboarding_ops"
  | "field_inspector"
  | "legal_compliance"
  | "regional_manager"
  | "dealer_admin";


export type User = {
    id: string;
    externalId: string;
    userName: string;
    password?: string;
    phoneNumber: string;
    emailAddress: string;
    roleType: UserRole;
    userSubRole?: UserSubRole;
    lastLoginTime: string;
    lastLoginIp: string;
    authToken?: string;
    expiryTime?: number;
};

export type DealerLimit = {
  applicationId: string;
  limitAmount: number;
  utilisationAmount: number;
  availableAmount: number;
  principalOverdue: number;
};

// --- Dealer Onboarding Module Types ---

export type DealerOnboardingStatus = 
  | 'Lead Created'
  | 'Lead Verified'
  | 'Documents Collected'
  | 'Documents Verified'
  | 'Site Visit Done'
  | 'Business Limit Approved'
  | 'Dealer Activated'
  | 'Onboarding Dropped';

export type Document = {
    name: string;
    url: string;
    status?: 'Pending' | 'Verified' | 'Rejected';
};

export type Comment = {
  user: string;
  comment: string;
  timestamp: string;
};

export type DealerLead = {
    id: string;
    dealerName: string;
    contactPerson: string;
    contactEmail: string;
    contactPhone: string;
    businessType: string;
    location: string;
    region: string;
    status: DealerOnboardingStatus;
    createdBy: string; // Typically a sales_person ID
    createdAt: string;
    documents?: Document[];
    siteVisitReport?: { notes: string; images: string[] };
    businessLimit?: number;
    paymentTerms?: string;
    dealerCode?: string;
    comments?: Comment[];
    requestedLimit?: number;
    approvedLimit?: number;
    creditCheckScore?: number;
};


// --- Collection Module Types ---
export type RepaymentStatus = 'Link Sent' | 'Partially Paid' | 'Paid' | 'Failed';

export type Repayment = {
    id: string;
    invoiceId: string;
    invoiceAmount: number;
    dueDate: string;
    contactNumber: string;
    amountRepaid: number;
    status: RepaymentStatus;
    link: string;
};

export type MomentumDealerLead = {
  id: string;
  anchorId: string;
  assignedTo: string;
  city: string;
  createdAt: string; // ISO date string
  dealValue: number;
  initialLeadDate: string; // ISO date string
  leadDate: string; // ISO date string
  leadId: string;
  leadSource: string;
  leadType: string;
  lenderId: string;
  name: string;
  product: string;
  remarks: any[];
  spoc: string;
  state: string;
  status: string;
  updatedAt: string; // ISO date string
  zone: string;
}
