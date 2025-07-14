
import type { Lead, LeadStatus, User } from '@/types';
import { db } from './firebase';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import type { Dealer, Invoice, Program } from '@/types';
import { format, subDays, addDays } from 'date-fns';

const today = new Date();

// --- MOCK DATA ---

const mockDealers: Dealer[] = [
  { id: 'DLR001', name: 'Reliance Digital', status: 'Active', creditAssigned: 5000000, invoicesSubmitted: 25, amountDisbursed: 4200000, overdueCount: 1, overdueAmount: 250000, lenders: ['Supermoney Finance', 'ADITYA BIRLA CAPITAL LTD'] },
  { id: 'DLR002', name: 'Vijay Sales', status: 'Active', creditAssigned: 7500000, invoicesSubmitted: 40, amountDisbursed: 6800000, overdueCount: 0, overdueAmount: 0, lenders: ['Supermoney Finance', 'CHOLAMANDALAM INVEST...'] },
  { id: 'DLR003', name: 'Croma', status: 'Inactive', creditAssigned: 3000000, invoicesSubmitted: 15, amountDisbursed: 2500000, overdueCount: 3, overdueAmount: 450000, lenders: ['ADITYA BIRLA CAPITAL LTD'] },
  { id: 'DLR004', name: 'Sangeetha Mobiles', status: 'Active', creditAssigned: 4000000, invoicesSubmitted: 30, amountDisbursed: 3500000, overdueCount: 0, overdueAmount: 0, lenders: ['Supermoney Finance'] },
  { id: 'DLR005', name: 'Girish Stores', status: 'Pending', creditAssigned: 1000000, invoicesSubmitted: 2, amountDisbursed: 500000, overdueCount: 0, overdueAmount: 0, lenders: ['Flexi Loans'] },
];

const mockInvoices: Invoice[] = [
  { id: 'INV001', invoiceNumber: 'SM-RD-2024-001', dealerName: 'Reliance Digital', amount: 300000, date: format(subDays(today, 5), 'yyyy-MM-dd'), dueDate: format(addDays(today, 25), 'yyyy-MM-dd'), eWayBillNumber: 'EWB123456789', status: 'Disbursed', lender: 'Supermoney Finance', overdueAmount: 0 },
  { id: 'INV002', invoiceNumber: 'SM-VS-2024-002', dealerName: 'Vijay Sales', amount: 500000, date: format(subDays(today, 10), 'yyyy-MM-dd'), dueDate: format(addDays(today, 20), 'yyyy-MM-dd'), eWayBillNumber: 'EWB987654321', status: 'Disbursed', lender: 'CHOLAMANDALAM INVEST...', overdueAmount: 0 },
  { id: 'INV003', invoiceNumber: 'SM-CR-2024-003', dealerName: 'Croma', amount: 250000, date: format(subDays(today, 40), 'yyyy-MM-dd'), dueDate: format(subDays(today, 10), 'yyyy-MM-dd'), eWayBillNumber: 'EWB456123789', status: 'Disbursed', lender: 'ADITYA BIRLA CAPITAL LTD', overdueAmount: 250000 },
  { id: 'INV004', invoiceNumber: 'SM-SM-2024-004', dealerName: 'Sangeetha Mobiles', amount: 150000, date: format(subDays(today, 2), 'yyyy-MM-dd'), dueDate: format(addDays(today, 28), 'yyyy-MM-dd'), eWayBillNumber: 'EWB789123456', status: 'Approved', lender: 'Supermoney Finance', overdueAmount: 0 },
  { id: 'INV005', invoiceNumber: 'SM-GS-2024-005', dealerName: 'Girish Stores', amount: 100000, date: format(subDays(today, 1), 'yyyy-MM-dd'), dueDate: format(addDays(today, 59), 'yyyy-MM-dd'), eWayBillNumber: 'EWB321654987', status: 'Initiated', lender: 'Flexi Loans', overdueAmount: 0 },
  { id: 'INV006', invoiceNumber: 'SM-RD-2024-006', dealerName: 'Reliance Digital', amount: 450000, date: format(subDays(today, 15), 'yyyy-MM-dd'), dueDate: format(addDays(today, 15), 'yyyy-MM-dd'), eWayBillNumber: 'EWB654987123', status: 'Sent to Lender', lender: 'ADITYA BIRLA CAPITAL LTD', overdueAmount: 0 },
  { id: 'INV007', invoiceNumber: 'SM-VS-2024-007', dealerName: 'Vijay Sales', amount: 600000, date: format(subDays(today, 8), 'yyyy-MM-dd'), dueDate: format(addDays(today, 22), 'yyyy-MM-dd'), eWayBillNumber: 'EWB987321654', status: 'Disbursed', lender: 'Supermoney Finance', overdueAmount: 0 },
  { id: 'INV008', invoiceNumber: 'SM-CR-2024-008', dealerName: 'Croma', amount: 200000, date: format(subDays(today, 50), 'yyyy-MM-dd'), dueDate: format(subDays(today, 20), 'yyyy-MM-dd'), eWayBillNumber: 'EWB123789456', status: 'Disbursed', lender: 'ADITYA BIRLA CAPITAL LTD', overdueAmount: 200000 },
  { id: 'INV009', invoiceNumber: 'SM-RD-2024-009', dealerName: 'Reliance Digital', amount: 250000, date: format(subDays(today, 35), 'yyyy-MM-dd'), dueDate: format(subDays(today, 5), 'yyyy-MM-dd'), eWayBillNumber: 'EWB456789123', status: 'Disbursed', lender: 'ADITYA BIRLA CAPITAL LTD', overdueAmount: 250000 },
  { id: 'INV010', invoiceNumber: 'SM-VS-2024-010', dealerName: 'Vijay Sales', amount: 350000, date: format(subDays(today, 3), 'yyyy-MM-dd'), dueDate: format(addDays(today, 27), 'yyyy-MM-dd'), eWayBillNumber: 'EWB789456123', status: 'Rejected', lender: 'CHOLAMANDALAM INVEST...', overdueAmount: 0 },
];

const mockPrograms: Program[] = [
    { id: 'PROG001', lenderName: 'Supermoney Finance', lenderType: 'Supermoney', totalLimit: 10000000, usedLimit: 5150000, invoicesCount: 15, disbursedAmount: 4800000, totalDealers: 3, overdueCount: 0, pendingInvoicesCount: 2 },
    { id: 'PROG002', lenderName: 'ADITYA BIRLA CAPITAL LTD', lenderType: 'External', totalLimit: 8000000, usedLimit: 4950000, invoicesCount: 10, disbursedAmount: 4500000, totalDealers: 2, overdueCount: 2, pendingInvoicesCount: 1 },
    { id: 'PROG003', lenderName: 'CHOLAMANDALAM INVEST...', lenderType: 'External', totalLimit: 12000000, usedLimit: 500000, invoicesCount: 8, disbursedAmount: 500000, totalDealers: 1, overdueCount: 0, pendingInvoicesCount: 0 },
    { id: 'PROG004', lenderName: 'Flexi Loans', lenderType: 'External', totalLimit: 5000000, usedLimit: 100000, invoicesCount: 1, disbursedAmount: 100000, totalDealers: 1, overdueCount: 0, pendingInvoicesCount: 1 },
];

const mockUsers: User[] = [
  {
    id: 'USER001',
    externalId: 'EXT001',
    userName: 'Supermoney Anchor',
    password: 'password',
    phoneNumber: '9876543210',
    emailAddress: 'anchor@supermoney.in',
    roleType: 'Anchor',
    lastLoginTime: '2024-07-22T10:00:00Z',
    lastLoginIp: '192.168.1.1',
  }
];


// --- MOCK API FUNCTIONS ---

// Functions to fetch data from mock data instead of Firestore

export async function getDealers(): Promise<Dealer[]> {
  // const dealersCol = collection(db, 'dealers');
  // const dealerSnapshot = await getDocs(dealersCol);
  // const dealerList = dealerSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Dealer));
  return Promise.resolve(mockDealers);
}

export async function getInvoices(): Promise<Invoice[]> {
  // const invoicesCol = collection(db, 'invoices');
  // const invoiceSnapshot = await getDocs(invoicesCol);
  // const invoiceList = invoiceSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Invoice));
  return Promise.resolve(mockInvoices);
}

export async function getRecentInvoices(count: number): Promise<Invoice[]> {
    // const invoicesCol = collection(db, 'invoices');
    // const q = query(invoicesCol, orderBy('date', 'desc'), limit(count));
    // const invoiceSnapshot = await getDocs(q);
    // const invoiceList = invoiceSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Invoice));
    const sortedInvoices = [...mockInvoices].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return Promise.resolve(sortedInvoices.slice(0, count));
}

export async function getPrograms(): Promise<Program[]> {
  // const programsCol = collection(db, 'programs');
  // const programSnapshot = await getDocs(programSnapshot);
  // const programList = programSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Program));
  return Promise.resolve(mockPrograms);
}

export async function getUserByEmail(email: string): Promise<User | null> {
  // const usersRef = collection(db, 'users');
  // const q = query(usersRef, where('emailAddress', '==', email), limit(1));
  // const querySnapshot = await getDocs(q);
  
  // if (querySnapshot.empty) {
  //   return null;
  // }
  
  // const userDoc = querySnapshot.docs[0];
  // return { id: userDoc.id, ...userDoc.data() } as User;
  
  const user = mockUsers.find(u => u.emailAddress === email) || null;
  return Promise.resolve(user);
}


// --- STATIC DATA (Can remain as is) ---

export const leadStatuses: LeadStatus[] = ['Lead Created', 'Registered', 'KYC', 'Credit', 'Operations', 'PSD Completed', 'Dropped'];

export const leads: Lead[] = [
  { id: 'LEAD001', dealerName: 'New Age Retail', contactPerson: 'John Doe', contactEmail: 'john.d@newage.com', status: 'KYC', createdAt: '2024-07-15' },
  { id: 'LEAD002', dealerName: 'Mega Stores', contactPerson: 'Jane Smith', contactEmail: 'jane.s@megastores.com', status: 'Credit', createdAt: '2024-07-10' },
  { id: 'LEAD003', dealerName: 'The Corner Shop', contactPerson: 'Peter Jones', contactEmail: 'p.jones@cornershop.com', status: 'Lead Created', createdAt: '2024-07-20' },
  { id: 'LEAD004', dealerName: 'Daily Needs', contactPerson: 'Mary Johnson', contactEmail: 'mary.j@dailyneeds.com', status: 'PSD Completed', createdAt: '2024-06-25' },
  { id: 'LEAD005', dealerName: 'Value Mart', contactPerson: 'Chris Lee', contactEmail: 'chris.l@valuemart.com', status: 'Dropped', createdAt: '2024-07-05' },
];

export const invoiceStatuses: ['Initiated', 'Approved', 'Sent to Lender', 'Disbursed', 'Rejected'] = ['Initiated', 'Approved', 'Sent to Lender', 'Disbursed', 'Rejected'];
