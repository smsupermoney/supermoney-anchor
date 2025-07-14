import type { Lead, LeadStatus } from '@/types';
import { db } from './firebase';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import type { Dealer, Invoice, Program } from '@/types';

// Functions to fetch data from Firestore

export async function getDealers() {
  const dealersCol = collection(db, 'dealers');
  const dealerSnapshot = await getDocs(dealersCol);
  const dealerList = dealerSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Dealer));
  return dealerList;
}

export async function getInvoices() {
  const invoicesCol = collection(db, 'invoices');
  const invoiceSnapshot = await getDocs(invoicesCol);
  const invoiceList = invoiceSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Invoice));
  return invoiceList;
}

export async function getRecentInvoices(count: number) {
    const invoicesCol = collection(db, 'invoices');
    const q = query(invoicesCol, orderBy('date', 'desc'), limit(count));
    const invoiceSnapshot = await getDocs(q);
    const invoiceList = invoiceSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Invoice));
    return invoiceList;
}

export async function getPrograms() {
  const programsCol = collection(db, 'programs');
  const programSnapshot = await getDocs(programsCol);
  const programList = programSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Program));
  return programList;
}

// Keeping leads data static as per request
export const leadStatuses: LeadStatus[] = ['Lead Created', 'Registered', 'KYC', 'Credit', 'Operations', 'PSD Completed', 'Dropped'];

export const leads: Lead[] = [
  { id: 'LEAD001', dealerName: 'New Age Retail', contactPerson: 'John Doe', contactEmail: 'john.d@newage.com', status: 'KYC', createdAt: '2024-07-15' },
  { id: 'LEAD002', dealerName: 'Mega Stores', contactPerson: 'Jane Smith', contactEmail: 'jane.s@megastores.com', status: 'Credit', createdAt: '2024-07-10' },
  { id: 'LEAD003', dealerName: 'The Corner Shop', contactPerson: 'Peter Jones', contactEmail: 'p.jones@cornershop.com', status: 'Lead Created', createdAt: '2024-07-20' },
  { id: 'LEAD004', dealerName: 'Daily Needs', contactPerson: 'Mary Johnson', contactEmail: 'mary.j@dailyneeds.com', status: 'PSD Completed', createdAt: '2024-06-25' },
  { id: 'LEAD005', dealerName: 'Value Mart', contactPerson: 'Chris Lee', contactEmail: 'chris.l@valuemart.com', status: 'Dropped', createdAt: '2024-07-05' },
];

// For filter dropdowns, we can keep some static lists or derive them
export const invoiceStatuses: ['Initiated', 'Approved', 'Sent to Lender', 'Disbursed', 'Rejected'] = ['Initiated', 'Approved', 'Sent to Lender', 'Disbursed', 'Rejected'];
