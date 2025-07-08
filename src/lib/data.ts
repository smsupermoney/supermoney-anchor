import type { Vendor, Invoice, Lender } from '@/types';

export const vendors: Vendor[] = [
  { id: 'VEN001', name: 'Global Mart', kycStatus: 'approved', category: 'Tier 1', outstandingAmount: 450000, creditRating: 'AA' },
  { id: 'VEN002', name: 'Quick Stop Supplies', kycStatus: 'approved', category: 'Tier 2', outstandingAmount: 250000, creditRating: 'A' },
  { id: 'VEN003', name: 'City Grocers Ltd', kycStatus: 'pending', category: 'Tier 1', outstandingAmount: 50000, creditRating: 'N/A' },
  { id: 'VEN004', name: 'Super Bazaar Inc', kycStatus: 'rejected', category: 'Tier 3', outstandingAmount: 20000, creditRating: 'C' },
  { id: 'VEN005', name: 'Fresh Foods Inc.', kycStatus: 'approved', category: 'Tier 1', outstandingAmount: 700000, creditRating: 'AA+' },
];

export const lenders: Lender[] = [
    {
        id: 'LEND001',
        name: 'Supermoney Finance',
        limitType: 'Fungible',
        totalLimit: 2500000,
        programs: [
            { id: 'PROG-SM-V', name: 'Vendor Financing', limit: null, interestRate: 12.5 },
            { id: 'PROG-SM-D', name: 'Dealer Financing', limit: null, interestRate: 13.0 },
        ]
    },
    {
        id: 'LEND002',
        name: 'Aditya Birla Capital',
        limitType: 'Ring-fenced',
        totalLimit: 2000000,
        programs: [
            { id: 'PROG-AB-V', name: 'Vendor Financing', limit: 1200000, interestRate: 11.8 },
            { id: 'PROG-AB-D', name: 'Dealer Financing', limit: 800000, interestRate: 12.2 },
        ]
    },
    {
        id: 'LEND003',
        name: 'Cholamandalam Investment',
        limitType: 'Ring-fenced',
        totalLimit: 1000000,
        programs: [
            { id: 'PROG-CHOLA-V', name: 'Vendor Financing', limit: 1000000, interestRate: 12.0 },
        ]
    }
];

export const invoices: Invoice[] = [
  // Supermoney Invoices
  { id: 'INV001', invoiceNumber: 'SM-V-001', vendorName: 'Global Mart', programId: 'PROG-SM-V', programType: 'Payables', amount: 250000, invoiceDate: '2024-07-01', dueDate: '2024-08-01', status: 'Paid' },
  { id: 'INV002', invoiceNumber: 'SM-D-001', dealerName: 'City Distributors', programId: 'PROG-SM-D', programType: 'Receivables', amount: 150000, invoiceDate: '2024-07-05', dueDate: '2024-07-20', status: 'Financed' },
  
  // Aditya Birla Invoices
  { id: 'INV003', invoiceNumber: 'AB-V-001', vendorName: 'Global Mart', programId: 'PROG-AB-V', programType: 'Payables', amount: 300000, invoiceDate: '2024-07-10', dueDate: '2024-08-10', status: 'Approved' },
  { id: 'INV004', invoiceNumber: 'AB-D-001', dealerName: 'Metro Wholesalers', programId: 'PROG-AB-D', programType: 'Receivables', amount: 100000, invoiceDate: '2024-07-12', dueDate: '2024-08-12', status: 'Submitted' },
  
  // Cholamandalam Invoices
  { id: 'INV005', invoiceNumber: 'CHOLA-V-001', vendorName: 'Fresh Foods Inc.', programId: 'PROG-CHOLA-V', programType: 'Payables', amount: 500000, invoiceDate: '2024-07-15', dueDate: '2024-08-15', status: 'Financed' },

  // More invoices for variety
  { id: 'INV006', invoiceNumber: 'SM-V-002', vendorName: 'Quick Stop Supplies', programId: 'PROG-SM-V', programType: 'Payables', amount: 180000, invoiceDate: '2024-07-18', dueDate: '2024-08-18', status: 'Approved' },
  { id: 'INV007', invoiceNumber: 'AB-V-002', vendorName: 'Super Bazaar Inc', programId: 'PROG-AB-V', programType: 'Payables', amount: 50000, invoiceDate: '2024-07-20', dueDate: '2024-08-20', status: 'Disputed' },
  { id: 'INV008', invoiceNumber: 'SM-V-003', vendorName: 'Global Mart', programId: 'PROG-SM-V', programType: 'Payables', amount: 120000, invoiceDate: '2024-06-01', dueDate: '2024-07-01', status: 'Overdue' },
];
