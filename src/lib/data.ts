
import type { Lead, LeadStatus, User } from '@/types';
import { db } from './firebase';
import { collection, getDocs, query, where, orderBy, limit, documentId } from 'firebase/firestore';
import type { Dealer, Invoice, Program, DealerProgramLimit } from '@/types';

// --- API FUNCTIONS ---

// Functions to fetch data from Firestore

export async function getDealers(): Promise<Dealer[]> {
  const dealersCol = collection(db, 'dealers');
  const dealerSnapshot = await getDocs(dealersCol);
  const dealerList = dealerSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Dealer));
  
  const allInvoices = await getInvoices();

  // Calculate aggregates
  return dealerList.map(dealer => {
    const dealerInvoices = allInvoices.filter(i => i.dealerId === dealer.id);
    const overdueInvoices = dealerInvoices.filter(i => i.overdueAmount > 0);
    const disbursedAmount = dealerInvoices.filter(i => i.status === 'Disbursed').reduce((sum, i) => sum + i.amount, 0);
    
    return {
      ...dealer,
      invoicesSubmitted: dealerInvoices.length,
      amountDisbursed: disbursedAmount,
      overdueCount: overdueInvoices.length,
      overdueAmount: overdueInvoices.reduce((sum, i) => sum + i.overdueAmount, 0),
      lenders: Array.from(new Set(dealerInvoices.map(i => i.lender))),
    };
  });
}

export async function getInvoices(): Promise<Invoice[]> {
  const invoicesCol = collection(db, 'invoices');
  const invoiceSnapshot = await getDocs(invoicesCol);
  const invoiceList = invoiceSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Invoice));
  return invoiceList;
}

export async function getRecentInvoices(count: number, anchorId?: string): Promise<Invoice[]> {
    const invoicesCol = collection(db, 'invoices');
    let q;

    if (anchorId) {
        // Find programs for the anchor
        const programsCol = collection(db, 'programs');
        const anchorProgramsQuery = query(programsCol, where('anchorIds', 'array-contains', anchorId));
        const programSnapshot = await getDocs(anchorProgramsQuery);
        const programIds = programSnapshot.docs.map(doc => doc.id);

        if (programIds.length === 0) {
            return []; // No programs for this anchor, so no invoices
        }

        // Fetch invoices for those programs
        q = query(invoicesCol, where('programId', 'in', programIds), orderBy('date', 'desc'), limit(count));

    } else {
        // Fetch all recent invoices if no anchorId is provided
        q = query(invoicesCol, orderBy('date', 'desc'), limit(count));
    }

    const invoiceSnapshot = await getDocs(q);
    const invoiceList = invoiceSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Invoice));
    return invoiceList;
}

export async function getDealerProgramLimits(): Promise<DealerProgramLimit[]> {
    const limitsCol = collection(db, 'dealerProgramLimits');
    const limitsSnapshot = await getDocs(limitsCol);
    return limitsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DealerProgramLimit));
}


export async function getPrograms(anchorId?: string): Promise<Program[]> {
  const programsCol = collection(db, 'programs');
  let programSnapshot;

  if (anchorId) {
    const q = query(programsCol, where('anchorIds', 'array-contains', anchorId));
    programSnapshot = await getDocs(q);
  } else {
    programSnapshot = await getDocs(programsCol);
  }
  
  let programList = programSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Program));
  
  const [dealerProgramLimits, allInvoices] = await Promise.all([
      getDealerProgramLimits(),
      getInvoices(),
  ]);

  // Calculate total and used limits for each program
  programList.forEach(program => {
    program.totalLimit = 0;
    program.usedLimit = 0;
    program.invoicesCount = 0;
    program.disbursedAmount = 0;
    program.totalDealers = 0;
    program.overdueCount = 0;
    program.pendingInvoicesCount = 0;

    const relevantLimits = dealerProgramLimits.filter(l => l.programId === program.id);
    const dealerIdsInProgram = new Set(relevantLimits.map(l => l.dealerId));
    
    program.totalDealers = dealerIdsInProgram.size;

    relevantLimits.forEach(limit => {
      program.totalLimit! += limit.creditLimit;
      program.usedLimit! += limit.usedLimit;
    });

    const programInvoices = allInvoices.filter(i => i.programId === program.id);

    program.invoicesCount = programInvoices.length;
    program.disbursedAmount = programInvoices
        .filter(i => i.status === 'Disbursed')
        .reduce((sum, i) => sum + i.amount, 0);
    program.overdueCount = programInvoices.filter(i => i.overdueAmount > 0).length;
    program.pendingInvoicesCount = programInvoices.filter(i => i.status === 'Initiated' || i.status === 'Approved' || i.status === 'Sent to Lender').length;
  });
  
  return programList;
}


export async function getUserByEmail(email: string): Promise<User | null> {
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('emailAddress', '==', email), limit(1));
  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) {
    return null;
  }
  
  const userDoc = querySnapshot.docs[0];
  return { id: userDoc.id, ...userDoc.data() } as User;
}


// --- STATIC DATA ---

export const leadStatuses: LeadStatus[] = ['Lead Created', 'Registered', 'KYC', 'Credit', 'Operations', 'PSD Completed', 'Dropped'];

export const leads: Lead[] = [
  { id: 'LEAD001', dealerName: 'New Age Retail', contactPerson: 'John Doe', contactEmail: 'john.d@newage.com', status: 'KYC', createdAt: '2024-07-15' },
  { id: 'LEAD002', dealerName: 'Mega Stores', contactPerson: 'Jane Smith', contactEmail: 'jane.s@megastores.com', status: 'Credit', createdAt: '2024-07-10' },
  { id: 'LEAD003', dealerName: 'The Corner Shop', contactPerson: 'Peter Jones', contactEmail: 'p.jones@cornershop.com', status: 'Lead Created', createdAt: '2024-07-20' },
  { id: 'LEAD004', dealerName: 'Daily Needs', contactPerson: 'Mary Johnson', contactEmail: 'mary.j@dailyneeds.com', status: 'PSD Completed', createdAt: '2024-06-25' },
  { id: 'LEAD005', dealerName: 'Value Mart', contactPerson: 'Chris Lee', contactEmail: 'chris.l@valuemart.com', status: 'Dropped', createdAt: '2024-07-05' },
];

export const invoiceStatuses: ['Initiated', 'Approved', 'Sent to Lender', 'Disbursed', 'Rejected'] = ['Initiated', 'Approved', 'Sent to Lender', 'Disbursed', 'Rejected'];
