
export type Dealer = {
  id: string;
  name: string;
  status: 'Active' | 'Inactive' | 'Pending';
  lenders: string[];
  invoicesSubmitted: number;
  amountDisbursed: number;
  overdueCount: number;
  overdueAmount: number;
};

export type InvoiceStatus = 'Initiated' | 'Approved' | 'Sent to Lender' | 'Disbursed' | 'Rejected';

export type Invoice = {
  id: string;
  invoiceNumber: string;
  dealerId: string; // Link to Dealer
  programId: string; // Link to Program
  anchorId: string; // Link to Anchor/User
  dealerName: string;
  amount: number;
  date: string;
  dueDate: string;
  eWayBillNumber: string;
  documentUrl?: string;
  status: InvoiceStatus;
  lender: string;
  overdueAmount: number;
};

export type Program = {
  id: string;
  anchorIds: string[];
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
  | "Regional Manager"
  | "Auditor"
  | "Super Admin";

export type User = {
    id: string;
    externalId: string;
    userName: string;
    password?: string;
    phoneNumber: string;
    emailAddress: string;
    roleType: "Anchor" | "Dealer" | "Admin";
    userSubRole?: UserSubRole;
    lastLoginTime: string;
    lastLoginIp: string;
    authToken?: string;
    expiryTime?: number;
};

export type DealerProgramLimit = {
  id: string;
  dealerId: string;
  programId: string;
  creditLimit: number;
  usedLimit: number;
};
