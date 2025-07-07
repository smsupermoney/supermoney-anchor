export type Retailer = {
  id: string;
  name: string;
  status: 'Active' | 'Inactive' | 'Pending';
  creditAssigned: number;
  invoicesSubmitted: number;
  amountDisbursed: number;
};

export type InvoiceStatus = 'Initiated' | 'Approved' | 'Sent to Lender' | 'Disbursed' | 'Rejected';

export type Invoice = {
  id: string;
  invoiceNumber: string;
  retailerName: string;
  amount: number;
  date: string;
  dueDate: string;
  eWayBillNumber: string;
  documentUrl?: string;
  status: InvoiceStatus;
};

export type Program = {
  id: string;
  lenderName: string;
  totalLimit: number;
  usedLimit: number;
  invoicesCount: number;
  disbursedAmount: number;
};

export type LeadStatus = 'Lead Created' | 'Registered' | 'KYC' | 'Credit' | 'Operations' | 'PSD Completed' | 'Dropped';

export type Lead = {
  id: string;
  retailerName: string;
  contactPerson: string;
  contactEmail: string;
  status: LeadStatus;
  createdAt: string;
};
