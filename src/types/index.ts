export type Dealer = {
  id: string;
  name: string;
  status: 'Active' | 'Inactive' | 'Pending';
  // Aggregate fields removed, will be calculated at runtime.
  // lenders will be derived from dealerProgramLimits.
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
  // Aggregate fields removed, will be calculated at runtime.
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

export type User = {
    id: string;
    externalId: string;
    userName: string;
    password?: string;
    phoneNumber: string;
    emailAddress: string;
    roleType: "Anchor" | "Dealer" | "Admin";
    lastLoginTime: string;
    lastLoginIp: string;
};

export type DealerProgramLimit = {
  id: string;
  dealerId: string;
  programId: string;
  creditLimit: number;
  usedLimit: number;
};
