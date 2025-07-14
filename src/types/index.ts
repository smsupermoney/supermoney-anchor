export type Dealer = {
  id: string;
  name: string;
  status: 'Active' | 'Inactive' | 'Pending';
  creditAssigned: number;
  invoicesSubmitted: number;
  amountDisbursed: number;
  overdueCount: number;
  overdueAmount: number;
  lenders: string[];
};

export type InvoiceStatus = 'Initiated' | 'Approved' | 'Sent to Lender' | 'Disbursed' | 'Rejected';

export type Invoice = {
  id: string;
  invoiceNumber: string;
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
  lenderName: string;
  lenderType: 'Supermoney' | 'External';
  totalLimit: number;
  usedLimit: number;
  invoicesCount: number;
  disbursedAmount: number;
  totalDealers: number;
  overdueCount: number;
  pendingInvoicesCount: number;
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
}
