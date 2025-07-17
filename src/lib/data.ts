
import type { Lead, LeadStatus, User, DealerLead, DealerOnboardingStatus } from '@/types';
import { db } from './firebase';
import { collection, getDocs, query, where, documentId, updateDoc, doc } from 'firebase/firestore';
import type { Dealer, Invoice, Program, DealerProgramLimit } from '@/types';

// --- API FUNCTIONS ---

// Functions to fetch data from Firestore

export async function getInvoices(anchorId?: string): Promise<Invoice[]> {
  const invoicesCol = collection(db, 'invoices');
  let q = query(invoicesCol);

  if (anchorId) {
    q = query(invoicesCol, where('anchorId', '==', anchorId));
  }

  const invoiceSnapshot = await getDocs(q);
  return invoiceSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Invoice));
}

export async function getDealers(anchorId?: string): Promise<Dealer[]> {
  const dealersCol = collection(db, 'dealers');
  let dealerQuery = query(dealersCol);

  if (anchorId) {
    dealerQuery = query(dealersCol, where('anchorId', '==', anchorId));
  }
  
  const dealerSnapshot = await getDocs(dealerQuery);
  if (dealerSnapshot.empty) {
    return [];
  }
  
  const dealerList = dealerSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Dealer));
  
  // Fetch invoices only for the relevant anchor to ensure calculations are scoped
  const allInvoices = await getInvoices(anchorId); 

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

export async function getDealerProgramLimits(programIds?: string[]): Promise<DealerProgramLimit[]> {
    const limitsCol = collection(db, 'dealerProgramLimits');
    
    if (!programIds) { // Admin case - fetch all
        const limitsSnapshot = await getDocs(query(limitsCol));
        return limitsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DealerProgramLimit));
    }
    
    if (programIds.length === 0) {
        return [];
    }

    const limitsSnapshot = await getDocs(query(limitsCol, where('programId', 'in', programIds)));
    return limitsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DealerProgramLimit));
}


export async function getPrograms(anchorId?: string): Promise<{programs: Program[], invoices: Invoice[]}> {
  // 1. Fetch programs. If anchorId is provided, filter by it.
  const programsCol = collection(db, 'programs');
  let programQuery = query(programsCol);
  if (anchorId) {
    programQuery = query(programsCol, where('anchorIds', 'array-contains', anchorId));
  }
  const programSnapshot = await getDocs(programQuery);
  let programList = programSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Program));
  const programIds = programList.map(p => p.id);

  // 2. Fetch related data (limits and invoices) scoped by the programs and/or anchor.
  const [dealerProgramLimits, anchorInvoices] = await Promise.all([
      getDealerProgramLimits(programIds.length > 0 ? programIds : undefined),
      getInvoices(anchorId),
  ]);
  
  // 3. Calculate aggregates for each program using ONLY the correctly scoped data.
  programList.forEach(program => {
    // Initialize aggregates
    program.totalLimit = 0;
    program.usedLimit = 0;
    program.totalDealers = 0;

    const relevantLimits = dealerProgramLimits.filter(l => l.programId === program.id);
    const dealerIdsInProgram = new Set<string>();
    
    relevantLimits.forEach(limit => {
      program.totalLimit! += limit.creditLimit;
      program.usedLimit! += limit.usedLimit;
      dealerIdsInProgram.add(limit.dealerId);
    });
    program.totalDealers = dealerIdsInProgram.size;

    // Filter invoices for the current program being processed
    const programInvoices = anchorInvoices.filter(i => i.programId === program.id);
    
    program.invoicesCount = programInvoices.length;
    program.disbursedAmount = programInvoices
        .filter(i => i.status === 'Disbursed')
        .reduce((sum, i) => sum + i.amount, 0);
    program.overdueCount = programInvoices.filter(i => i.overdueAmount > 0).length;
    program.pendingInvoicesCount = programInvoices.filter(i => ['Initiated', 'Approved', 'Sent to Lender'].includes(i.status)).length;
  });
  
  return { programs: programList, invoices: anchorInvoices };
}


export async function getUserByEmail(email: string): Promise<User | null> {
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('emailAddress', '==', email));
  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) {
    return null;
  }
  
  const userDoc = querySnapshot.docs[0];
  return { id: userDoc.id, ...userDoc.data() } as User;
}

export async function clearUserAuthToken(email: string): Promise<void> {
  const user = await getUserByEmail(email);
  if (user) {
    const userRef = doc(db, 'users', user.id);
    await updateDoc(userRef, {
      authToken: '',
      expiryTime: 0,
    });
  }
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

// --- DEALER ONBOARDING STATIC DATA ---
export const dealerOnboardingStatuses: DealerOnboardingStatus[] = [
  'Lead Created',
  'Lead Verified',
  'Documents Collected',
  'Documents Verified',
  'Site Visit Done',
  'Business Limit Approved',
  'Dealer Activated'
];

export const dealerLeads: DealerLead[] = [
    // For sales_manager to validate
    {
        id: 'DL001',
        dealerName: 'Global Electronics',
        contactPerson: 'Ravi Kumar',
        contactEmail: 'ravi.k@globalelectro.com',
        contactPhone: '9876543210',
        businessType: 'Electronics Retail',
        location: 'Mumbai, MH',
        region: 'West',
        status: 'Lead Created',
        createdBy: 'Sales Person',
        createdAt: '2024-07-20',
        comments: [
          { user: 'Sales Person', comment: 'New lead, looks promising.', timestamp: '2024-07-20 10:00 AM' }
        ]
    },
    // For sales_person/onboarding_ops to collect documents
    {
        id: 'DL007',
        dealerName: 'Modern Mobiles',
        contactPerson: 'Rohan Gupta',
        contactEmail: 'rohan.g@modernmobiles.com',
        contactPhone: '9876543211',
        businessType: 'Mobile Retail',
        location: 'Kolkata, WB',
        region: 'East',
        status: 'Lead Verified',
        createdBy: 'Sales Person',
        createdAt: '2024-07-19',
        comments: [
            { user: 'Sales Person', comment: 'Initial contact made.', timestamp: '2024-07-19 02:15 PM' },
            { user: 'Sales Manager', comment: 'Lead has been verified. Please proceed with document collection.', timestamp: '2024-07-20 11:00 AM' }
        ]
    },
    // For onboarding_ops/legal_compliance to verify documents
    {
        id: 'DL006',
        dealerName: 'Fresh Grocers',
        contactPerson: 'Alia Khan',
        contactEmail: 'alia.k@freshgrocers.com',
        contactPhone: '9876543212',
        businessType: 'Grocery Store',
        location: 'Hyderabad, TS',
        region: 'South',
        status: 'Documents Collected',
        createdBy: 'Sales Person',
        createdAt: '2024-07-21',
        documents: [
            { name: 'GST Certificate', url: '#', status: 'Pending' },
            { name: 'PAN Card', url: '#', status: 'Pending' },
            { name: 'Shop License', url: '#', status: 'Pending' },
        ],
        comments: [
           { user: 'Onboarding Ops', comment: 'All initial documents have been uploaded.', timestamp: '2024-07-21 03:00 PM' }
        ]
    },
    // For field_inspector to do site visit
    {
        id: 'DL002',
        dealerName: 'Quick Supplies',
        contactPerson: 'Priya Sharma',
        contactEmail: 'priya.s@quicksupplies.com',
        contactPhone: '9876543213',
        businessType: 'General Store',
        location: 'Delhi, DL',
        region: 'North',
        status: 'Documents Verified',
        createdBy: 'Sales Person',
        createdAt: '2024-07-18',
        documents: [
            { name: 'GST Certificate', url: '#', status: 'Verified' },
            { name: 'PAN Card', url: '#', status: 'Verified' },
        ],
        comments: [
          { user: 'Legal Compliance', comment: 'Documents look good. Cleared for site visit.', timestamp: '2024-07-22 09:30 AM'}
        ]
    },
    // For regional_manager/legal_compliance to approve limit
    {
        id: 'DL003',
        dealerName: 'Metro Appliances',
        contactPerson: 'Anil Mehta',
        contactEmail: 'anil.m@metroappliances.com',
        contactPhone: '9876543214',
        businessType: 'Home Appliances',
        location: 'Bengaluru, KA',
        region: 'South',
        status: 'Site Visit Done',
        createdBy: 'Sales Person',
        createdAt: '2024-07-15',
        documents: [
            { name: 'GST Certificate', url: '#', status: 'Verified' },
            { name: 'PAN Card', url: '#', status: 'Verified' },
            { name: 'Shop License', url: '#', status: 'Verified' },
        ],
        siteVisitReport: {
            notes: 'Shop is in a prime location with good footfall. Owner is cooperative.',
            images: ['/placeholder.png', '/placeholder.png']
        },
        comments: [
            { user: 'Field Inspector', comment: 'Site visit completed. Report submitted.', timestamp: '2024-07-22 01:00 PM'}
        ]
    },
    // For dealer_admin to activate
    {
        id: 'DL004',
        dealerName: 'Super Farm Co.',
        contactPerson: 'Sunita Rao',
        contactEmail: 'sunita.r@superfarm.com',
        contactPhone: '9876543215',
        businessType: 'Agri Supplies',
        location: 'Pune, MH',
        region: 'West',
        status: 'Business Limit Approved',
        businessLimit: 500000,
        paymentTerms: 'Net 30',
        createdBy: 'Sales Person',
        createdAt: '2024-07-12',
        comments: [
            { user: 'Regional Manager', comment: 'Approved a limit of 5 Lacs with Net 30 terms. Ready for activation.', timestamp: '2024-07-23 11:00 AM'}
        ]
    },
    // Completed
    {
        id: 'DL005',
        dealerName: 'City Hardware',
        contactPerson: 'Vijay Singh',
        contactEmail: 'vijay.s@cityhardware.com',
        contactPhone: '9876543216',
        businessType: 'Hardware Store',
        location: 'Chennai, TN',
        region: 'South',
        status: 'Dealer Activated',
        businessLimit: 250000,
        paymentTerms: 'Net 45',
        dealerCode: 'DEALER-CH-00123',
        createdBy: 'Sales Person',
        createdAt: '2024-07-10',
    },
];


