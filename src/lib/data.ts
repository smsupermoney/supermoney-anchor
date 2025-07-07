import type { Retailer, Invoice, Program, Lead, InvoiceStatus, LeadStatus } from '@/types';

export const retailers: Retailer[] = [
  { id: 'RET001', name: 'Global Mart', status: 'Active', creditAssigned: 500000, invoicesSubmitted: 25, amountDisbursed: 450000 },
  { id: 'RET002', name: 'Quick Stop', status: 'Active', creditAssigned: 300000, invoicesSubmitted: 15, amountDisbursed: 250000 },
  { id: 'RET003', name: 'City Grocers', status: 'Pending', creditAssigned: 200000, invoicesSubmitted: 5, amountDisbursed: 50000 },
  { id: 'RET004', name: 'Super Bazaar', status: 'Inactive', creditAssigned: 100000, invoicesSubmitted: 2, amountDisbursed: 20000 },
  { id: 'RET005', name: 'Fresh Foods Inc.', status: 'Active', creditAssigned: 750000, invoicesSubmitted: 40, amountDisbursed: 700000 },
];

export const invoiceStatuses: InvoiceStatus[] = ['Initiated', 'Approved', 'Sent to Lender', 'Disbursed', 'Rejected'];

export const invoices: Invoice[] = [
  { id: 'INV001', invoiceNumber: '2024-001', retailerName: 'Global Mart', amount: 25000, date: '2024-07-01', dueDate: '2024-08-01', eWayBillNumber: 'EWB12345', status: 'Disbursed' },
  { id: 'INV002', invoiceNumber: '2024-002', retailerName: 'Quick Stop', amount: 15000, date: '2024-07-05', dueDate: '2024-07-20', eWayBillNumber: 'EWB12346', status: 'Sent to Lender' },
  { id: 'INV003', invoiceNumber: '2024-003', retailerName: 'Global Mart', amount: 30000, date: '2024-07-10', dueDate: '2024-08-10', eWayBillNumber: 'EWB12347', status: 'Approved' },
  { id: 'INV004', invoiceNumber: '2024-004', retailerName: 'City Grocers', amount: 10000, date: '2024-07-12', dueDate: '2024-08-12', eWayBillNumber: 'EWB12348', status: 'Initiated' },
  { id: 'INV005', invoiceNumber: '2024-005', retailerName: 'Fresh Foods Inc.', amount: 50000, date: '2024-07-15', dueDate: '2024-08-15', eWayBillNumber: 'EWB12349', status: 'Disbursed' },
  { id: 'INV006', invoiceNumber: '2024-006', retailerName: 'Quick Stop', amount: 18000, date: '2024-07-18', dueDate: '2024-08-18', eWayBillNumber: 'EWB12350', status: 'Approved' },
  { id: 'INV007', invoiceNumber: '2024-007', retailerName: 'Super Bazaar', amount: 5000, date: '2024-07-20', dueDate: '2024-08-20', eWayBillNumber: 'EWB12351', status: 'Rejected' },
];

export const programs: Program[] = [
  { id: 'PROG01', lenderName: 'Capital Flow Bank', totalLimit: 1000000, usedLimit: 700000, invoicesCount: 40, disbursedAmount: 650000 },
  { id: 'PROG02', lenderName: 'FinTrust Lenders', totalLimit: 800000, usedLimit: 300000, invoicesCount: 20, disbursedAmount: 250000 },
  { id: 'PROG03', lenderName: 'Supply Chain Finance Co.', totalLimit: 1200000, usedLimit: 900000, invoicesCount: 60, disbursedAmount: 850000 },
];

export const leadStatuses: LeadStatus[] = ['Lead Created', 'Registered', 'KYC', 'Credit', 'Operations', 'PSD Completed', 'Dropped'];

export const leads: Lead[] = [
  { id: 'LEAD001', retailerName: 'New Age Retail', contactPerson: 'John Doe', contactEmail: 'john.d@newage.com', status: 'KYC', createdAt: '2024-07-15' },
  { id: 'LEAD002', retailerName: 'Mega Stores', contactPerson: 'Jane Smith', contactEmail: 'jane.s@megastores.com', status: 'Credit', createdAt: '2024-07-10' },
  { id: 'LEAD003', retailerName: 'The Corner Shop', contactPerson: 'Peter Jones', contactEmail: 'p.jones@cornershop.com', status: 'Lead Created', createdAt: '2024-07-20' },
  { id: 'LEAD004', retailerName: 'Daily Needs', contactPerson: 'Mary Johnson', contactEmail: 'mary.j@dailyneeds.com', status: 'PSD Completed', createdAt: '2024-06-25' },
  { id: 'LEAD005', retailerName: 'Value Mart', contactPerson: 'Chris Lee', contactEmail: 'chris.l@valuemart.com', status: 'Dropped', createdAt: '2024-07-05' },
];
