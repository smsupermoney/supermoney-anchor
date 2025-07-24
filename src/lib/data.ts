
import type { User, DealerLead, DealerOnboardingStatus, MomentumDealerLead, DealerLimit } from '@/types';
import { db1, db2 } from './firebase';
import { collection, getDocs, query, where, documentId, updateDoc, doc, getDoc } from 'firebase/firestore';
import type { Dealer, Invoice, Program } from '@/types';

// --- API FUNCTIONS ---

// Functions to fetch data from Firestore

export async function getMomentumDealerLeads(anchorId?: string): Promise<MomentumDealerLead[]> {
    if (!db2) {
      console.warn("Database 'db2' is not configured. Returning empty array for Momentum leads.");
      return [];
    }
    let dealerQuery = query(collection(db2, 'dealers'));

    if (anchorId) {
        dealerQuery = query(collection(db2, 'dealers'), where('anchorId', '==', anchorId));
    }
    
    const dealerSnapshot = await getDocs(dealerQuery);
    return dealerSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MomentumDealerLead));
}

export async function getUsers(): Promise<User[]> {
  const usersCol = collection(db1, 'users');
  const userSnapshot = await getDocs(query(usersCol));
  return userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
}

export async function getInvoices(anchorId?: string): Promise<Invoice[]> {
  const invoicesCol = collection(db1, 'invoices');
  let q = query(invoicesCol);

  if (anchorId) {
    const dealersForAnchor = await getDocs(query(collection(db1, 'dealers'), where('anchorId', '==', anchorId)));
    const dealerIds = dealersForAnchor.docs.map(d => d.data().dealerId);
    if (dealerIds.length > 0) {
        q = query(invoicesCol, where('dealerId', 'in', dealerIds));
    } else {
        return []; // No dealers for this anchor, so no invoices
    }
  }

  const [invoiceSnapshot, allDealersSnapshot, programSnapshot] = await Promise.all([
    getDocs(q),
    getDocs(collection(db1, 'dealers')),
    getDocs(collection(db1, 'programs'))
  ]);
  
  const dealerMap = new Map(allDealersSnapshot.docs.map(d => [d.data().dealerId, d.data().dealerName]));
  const programMap = new Map(programSnapshot.docs.map(p => [p.data().programId, p.data().lenderName]));


  return invoiceSnapshot.docs.map(doc => {
    const data = doc.data() as Omit<Invoice, 'id' | 'dealerName'>;
    const now = new Date();
    const dueDate = new Date(data.dueDate);
    const overdueAmount = dueDate < now && data.status !== 'Disbursed' ? data.amount : 0;
    
    return { 
        id: doc.id, 
        ...data,
        dealerName: dealerMap.get(data.dealerId) || 'Unknown Dealer',
        lender: programMap.get(data.programId) || 'Unknown Lender',
        overdueAmount: overdueAmount
    } as Invoice;
  });
}

export async function getDealers(anchorId?: string): Promise<Dealer[]> {
    const dealersCol = collection(db1, 'dealers');
    let dealerQuery = query(dealersCol);

    if (anchorId) {
        dealerQuery = query(dealersCol, where('anchorId', '==', anchorId));
    }
    
    const [dealerSnapshot, limitsSnapshot, invoicesSnapshot] = await Promise.all([
        getDocs(dealerQuery),
        getDocs(collection(db1, 'dealerLimits')), // Fetch all limits
        getInvoices(anchorId) // Fetch invoices scoped to the anchor
    ]);

    if (dealerSnapshot.empty) {
        return [];
    }
    
    const limitsMap = new Map(limitsSnapshot.docs.map(doc => [doc.id, doc.data() as DealerLimit]));
    
    const dealerList = dealerSnapshot.docs.map(doc => {
        const dealerData = doc.data();
        const dealerId = dealerData.dealerId;
        const dealerInvoices = invoicesSnapshot.filter(i => i.dealerId === dealerId);
        const overdueInvoices = dealerInvoices.filter(i => (i.overdueAmount ?? 0) > 0);
        const disbursedAmount = dealerInvoices.filter(i => i.status === 'Disbursed').reduce((sum, i) => sum + i.amount, 0);
        
        return {
            id: dealerId,
            name: dealerData.dealerName,
            anchorId: dealerData.anchorId,
            programId: dealerData.programId,
            invoicesSubmitted: dealerInvoices.length,
            amountDisbursed: disbursedAmount,
            overdueCount: overdueInvoices.length,
            overdueAmount: overdueInvoices.reduce((sum, i) => sum + (i.overdueAmount ?? 0), 0),
            lenders: Array.from(new Set(dealerInvoices.map(i => i.lender).filter(Boolean))) as string[],
            status: dealerData.status, // Use status from the document
        } as Dealer;
    });

    return dealerList;
}


export async function getDealerLimits(applicationIds?: string[]): Promise<DealerLimit[]> {
    if (!applicationIds || applicationIds.length === 0) {
        return [];
    }
    const limitsCol = collection(db1, 'dealerLimits');
    const q = query(limitsCol, where(documentId(), 'in', applicationIds));
    
    const limitsSnapshot = await getDocs(q);
    return limitsSnapshot.docs.map(doc => doc.data() as DealerLimit);
}


export async function getPrograms(anchorId?: string): Promise<{programs: Program[], invoices: Invoice[]}> {
    // 1. Fetch base programs, all dealers, and all limits
    const [programSnapshot, dealerSnapshot, limitsSnapshot] = await Promise.all([
        getDocs(collection(db1, 'programs')),
        getDocs(collection(db1, 'dealers')),
        getDocs(collection(db1, 'dealerLimits'))
    ]);
    
    const programMap = new Map(programSnapshot.docs.map(p => [p.id, { id: p.id, ...p.data() } as Program]));
    const allDealers = dealerSnapshot.docs.map(d => d.data() as { dealerId: string, anchorId: string, programId: string, applicationId: string });
    const limitsMap = new Map(limitsSnapshot.docs.map(l => [l.id, l.data() as DealerLimit]));

    // 2. Filter dealers based on anchorId if provided
    const relevantDealers = anchorId ? allDealers.filter(d => d.anchorId === anchorId) : allDealers;

    // 3. Get invoices for the relevant anchor
    const anchorInvoices = await getInvoices(anchorId);

    // 4. Aggregate data for each program based on the relevant dealers
    const programAggregates: Record<string, Program> = {};

    relevantDealers.forEach(dealer => {
        const programId = dealer.programId;
        const limit = limitsMap.get(dealer.applicationId);

        if (!programId || !limit) return; // Skip if no program or limit found

        if (!programAggregates[programId]) {
            const baseProgram = programMap.get(programId);
            if (!baseProgram) return; // Skip if base program doesn't exist

            programAggregates[programId] = {
                ...baseProgram,
                totalLimit: 0,
                usedLimit: 0,
                totalDealers: 0,
                invoicesCount: 0,
                disbursedAmount: 0,
                overdueCount: 0,
                pendingInvoicesCount: 0,
            };
        }

        const prog = programAggregates[programId];
        prog.totalLimit! += limit.limitAmount;
        prog.usedLimit! += limit.utilisationAmount;
    });
    
    // Aggregate invoice data for the programs that are relevant to the anchor
    anchorInvoices.forEach(invoice => {
        if (programAggregates[invoice.programId]) {
            const prog = programAggregates[invoice.programId];
            prog.invoicesCount!++;
            if (invoice.status === 'Disbursed') prog.disbursedAmount! += invoice.amount;
            if ((invoice.overdueAmount ?? 0) > 0) prog.overdueCount!++;
            if (['Initiated', 'Approved', 'Sent to Lender'].includes(invoice.status)) prog.pendingInvoicesCount!++;
        }
    });

    // Aggregate unique dealer counts per program
    const dealerCountPerProgram: Record<string, Set<string>> = {};
    relevantDealers.forEach(dealer => {
        if (dealer.programId) {
            if (!dealerCountPerProgram[dealer.programId]) {
                dealerCountPerProgram[dealer.programId] = new Set();
            }
            dealerCountPerProgram[dealer.programId].add(dealer.dealerId);
        }
    });

    Object.keys(programAggregates).forEach(programId => {
        programAggregates[programId].totalDealers = dealerCountPerProgram[programId]?.size || 0;
    });

    const finalProgramList = Object.values(programAggregates);

    return { programs: finalProgramList, invoices: anchorInvoices };
}


export async function getUserByEmail(email: string): Promise<User | null> {
  const usersRef = collection(db1, 'users');
  const q = query(usersRef, where('emailAddress', '==', email));
  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) {
    return null;
  }
  
  const userDoc = querySnapshot.docs[0];
  return { id: userDoc.id, ...userDoc.data() } as User;
}

export async function clearUserAuthToken(userId: string): Promise<void> {
    const userRef = doc(db1, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
        await updateDoc(userRef, {
            authToken: '',
            expiryTime: 0,
        });
    } else {
        console.warn(`Attempted to clear auth token for non-existent user: ${userId}`);
    }
}


// --- STATIC DATA ---

export const spokeStatuses = [
    'New', 'Partial Docs', 'Follow Up', 'Already Onboarded', 'Disbursed', 
    'Not reachable', 'Active', 'Unassigned Lead', 'Rejected', 'Not Interested', 
    'Onboarding', 'Approved PF Collected', 'Awaiting Sanction', 'Closed', 
    'Limit Live', 'Login Pending', 'On Hold', 'Queries Raised', 'Relook'
] as const;

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
        requestedLimit: 1000000,
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
        requestedLimit: 750000,
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
        requestedLimit: 500000,
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
        requestedLimit: 800000,
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
        requestedLimit: 2000000,
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
        requestedLimit: 500000,
        approvedLimit: 450000,
        creditCheckScore: 8,
        businessLimit: 450000, // This seems redundant if approvedLimit is present. Kept for compatibility.
        paymentTerms: 'Net 30',
        createdBy: 'Sales Person',
        createdAt: '2024-07-12',
        comments: [
            { user: 'Regional Manager', comment: 'Approved a limit of 4.5 Lacs with Net 30 terms. Ready for activation.', timestamp: '2024-07-23 11:00 AM'}
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
        requestedLimit: 300000,
        approvedLimit: 250000,
        creditCheckScore: 7,
        businessLimit: 250000,
        paymentTerms: 'Net 45',
        dealerCode: 'DEALER-CH-00123',
        createdBy: 'Sales Person',
        createdAt: '2024-07-10',
    },
];

    
