
import type { User, DealerLead, DealerOnboardingStatus, MomentumDealerLead, DealerLimit } from '@/types';
import { db1, db2 } from './firebase';
import { collection, getDocs, query, where, documentId, updateDoc, doc, getDoc, type Timestamp } from 'firebase/firestore';
import type { Dealer, Invoice, Program } from '@/types';

// --- API FUNCTIONS ---

// Helper to convert Firestore Timestamps to ISO strings
const processDocumentDates = (data: Record<string, any>): Record<string, any> => {
    const processedData = { ...data };
    for (const key in processedData) {
        if (processedData[key] && typeof processedData[key].toDate === 'function') {
            // This is a Firestore Timestamp
            const date = (processedData[key] as Timestamp).toDate();
            // Check if date is valid before converting
            if (!isNaN(date.getTime())) {
                processedData[key] = date.toISOString();
            } else {
                processedData[key] = null; // or some other placeholder for invalid dates
            }
        }
    }
    return processedData;
};


// Functions to fetch data from Firestore

export async function getMomentumDealerLeads(anchorId?: string): Promise<MomentumDealerLead[]> {
    const fetchLeads = async (collectionName: 'dealers' | 'vendors', category: 'Dealer' | 'Vendor') => {
        try {
            let leadsQuery;
            const leadsCol = collection(db2, collectionName);
            if (anchorId) {
                leadsQuery = query(leadsCol, where('anchorId', '==', anchorId));
            } else {
                leadsQuery = query(leadsCol);
            }
            const snapshot = await getDocs(leadsQuery);
            if (snapshot.empty) {
                return [];
            }
            return snapshot.docs.map(doc => {
                const data = doc.data();
                const processedData = processDocumentDates(data);
                return { id: doc.id, ...processedData, leadCategory: category } as MomentumDealerLead;
            });
        } catch (error) {
            console.error(`Error fetching from ${collectionName}:`, error);
            // If a collection doesn't exist, it will throw. We can ignore it and return an empty array.
            return [];
        }
    };

    const [dealerLeads, vendorLeads] = await Promise.all([
        fetchLeads('dealers', 'Dealer'),
        fetchLeads('vendors', 'Vendor')
    ]);
    
    const allLeads = [...dealerLeads, ...vendorLeads];
    
    // Sort all leads by createdAt date in descending order (newest first)
    allLeads.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return allLeads;
}

export async function getMomentumDealerLeadById(id: string): Promise<MomentumDealerLead | null> {
    const fetchLead = async (collectionName: 'dealers' | 'vendors', category: 'Dealer' | 'Vendor'): Promise<MomentumDealerLead | null> => {
        try {
            const docRef = doc(db2, collectionName, id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                const processedData = processDocumentDates(data);
                return { id: docSnap.id, ...processedData, leadCategory: category } as MomentumDealerLead;
            }
            return null;
        } catch(error) {
            // console.error(`Error fetching from ${collectionName} with id ${id}:`, error);
            return null;
        }
    }

    // Try fetching from 'dealers' first, then 'vendors'
    const dealerLead = await fetchLead('dealers', 'Dealer');
    if (dealerLead) {
        return dealerLead;
    }
    
    const vendorLead = await fetchLead('vendors', 'Vendor');
    return vendorLead;
}

export async function getUsers(): Promise<User[]> {
  const usersCol = collection(db1, 'users');
  const userSnapshot = await getDocs(query(usersCol));
  return userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
}

export async function getInvoices(anchorId?: string): Promise<Invoice[]> {
  const invoicesCol = collection(db1, 'invoices');
  let invoiceQuery;

  if (anchorId) {
    invoiceQuery = query(invoicesCol, where('anchorId', '==', anchorId));
  } else {
    // Admin case: fetch all invoices
    invoiceQuery = query(invoicesCol);
  }

  const [invoiceSnapshot, allDealersSnapshot, programSnapshot] = await Promise.all([
    getDocs(invoiceQuery),
    getDocs(collection(db1, 'dealers')),
    getDocs(collection(db1, 'programs')),
  ]);
  
  const dealerMap = new Map(allDealersSnapshot.docs.map(d => [d.id, {name: d.data().dealerName, anchorId: d.data().anchorId}]));
  const programMap = new Map(programSnapshot.docs.map(p => [p.data().programId, p.data().lenderName]));
  
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set to the beginning of today

  return invoiceSnapshot.docs.map(doc => {
    const data = doc.data() as Omit<Invoice, 'id' | 'dealerName'>;
    const dealerInfo = dealerMap.get(data.dealerId);
    
    const dueDate = new Date(data.dueDate);
    const isOverdue = data.status === 'Disbursed' && dueDate < today;
    const overdueAmount = isOverdue ? data.disbursementSentAmount : 0;
    
    return { 
        id: doc.id, 
        ...data,
        dealerName: dealerInfo?.name || 'Unknown Dealer',
        anchorId: dealerInfo?.anchorId || data.anchorId || '',
        lender: programMap.get(data.programId) || 'Unknown Lender',
        overdueAmount: overdueAmount,
        invoiceImage: data.invoiceImage || ''
    } as Invoice;
  });
}

export async function getDealers(anchorId?: string): Promise<Dealer[]> {
    const dealersCol = collection(db1, 'dealers');
    let dealerQuery = query(dealersCol);

    if (anchorId) {
        dealerQuery = query(dealersCol, where('anchorId', '==', anchorId));
    }
    
    const [dealerSnapshot, limitsSnapshot, invoicesSnapshot, programSnapshot, usersSnapshot] = await Promise.all([
        getDocs(dealerQuery),
        getDocs(collection(db1, 'dealerLimits')),
        getInvoices(anchorId), 
        getDocs(collection(db1, 'programs')),
        getDocs(collection(db1, 'users')),
    ]);

    if (dealerSnapshot.empty) {
        return [];
    }
    
    const limitsMap = new Map(limitsSnapshot.docs.map(doc => [doc.id, doc.data() as DealerLimit]));
    const programMap = new Map(programSnapshot.docs.map(p => [p.id, p.data().lenderName]));
    const userMap = new Map(usersSnapshot.docs.map(u => [u.data().externalId, u.data()]));

    const dealerList = dealerSnapshot.docs.map(doc => {
        const dealerData = doc.data();
        const dealerId = dealerData.dealerId;
        const limitData = limitsMap.get(dealerId);
        
        const dealerInvoices = invoicesSnapshot.filter(i => i.dealerId === dealerId);
        const dealerUser = userMap.get(dealerId);
        
        const limitAmount = limitData?.limitAmount || 0;
        const utilisationAmount = limitData?.utilisationAmount || 0;
        
        return {
            id: dealerId,
            name: dealerData.dealerName,
            emailAddress: dealerUser?.emailAddress || '',
            anchorId: dealerData.anchorId,
            programId: dealerData.programId,
            applicationId: dealerData.applicationId,
            customerId: dealerData.customerId,
            invoicesSubmitted: dealerInvoices.length,
            amountDisbursed: utilisationAmount,
            overdueCount: dealerInvoices.filter(i => (i.overdueAmount ?? 0) > 0).length,
            overdueAmount: limitData?.principalOverdue || 0,
            lenderName: programMap.get(dealerData.programId) || 'N/A',
            status: dealerData.status, 
            totalLimit: limitAmount,
            availableLimit: limitAmount - utilisationAmount,
        } as Dealer;
    });

    return dealerList;
}


export async function getDealerLimits(dealerIds?: string[]): Promise<DealerLimit[]> {
    if (!dealerIds || dealerIds.length === 0) {
        return [];
    }
    const limitsCol = collection(db1, 'dealerLimits');
    const q = query(limitsCol, where(documentId(), 'in', dealerIds));
    
    const limitsSnapshot = await getDocs(q);
    return limitsSnapshot.docs.map(doc => doc.data() as DealerLimit);
}


export async function getPrograms(anchorId?: string): Promise<{programs: Program[], invoices: Invoice[], totalOverdueAmount: number}> {
    const [programSnapshot, dealerSnapshot, limitsSnapshot, allInvoicesSnapshot] = await Promise.all([
        getDocs(collection(db1, 'programs')),
        getDocs(collection(db1, 'dealers')),
        getDocs(collection(db1, 'dealerLimits')),
        getInvoices(anchorId) // This is already filtered by anchorId if provided
    ]);

    const programMap = new Map(programSnapshot.docs.map(p => [p.id, { id: p.id, ...p.data() } as Program]));
    const limitsMap = new Map(limitsSnapshot.docs.map(l => [l.id, l.data() as DealerLimit]));
    
    // Use all dealers to correctly map programs, then filter
    const allDealers = dealerSnapshot.docs.map(d => d.data() as { dealerId: string, anchorId: string, programId: string });
    const relevantDealers = anchorId ? allDealers.filter(d => d.anchorId === anchorId) : allDealers;
    
    const programAggregates: Record<string, Program> = {};

    // Initialize all programs from the program map to ensure they appear even if they have no activity
    programMap.forEach(baseProgram => {
        programAggregates[baseProgram.id] = {
            ...baseProgram,
            totalLimit: 0,
            usedLimit: 0,
            totalDealers: 0,
            invoicesCount: 0,
            disbursedAmount: 0,
            overdueCount: 0,
            pendingInvoicesCount: 0,
            disbursedInvoicesCount: 0,
            initiatedInvoicesCount: 0,
        };
    });

    // Aggregate limits and dealer counts from relevant dealers
    const dealerCountPerProgram: Record<string, Set<string>> = {};
    let totalOverdueAmount = 0;
    const processedDealersForOverdue = new Set<string>();

    relevantDealers.forEach(dealer => {
        const programId = dealer.programId;
        const limit = limitsMap.get(dealer.dealerId);

        if (programId && programAggregates[programId] && limit) {
            programAggregates[programId].totalLimit! += limit.limitAmount;
            programAggregates[programId].usedLimit! += limit.utilisationAmount;
        }

        if (programId) {
            if (!dealerCountPerProgram[programId]) {
                dealerCountPerProgram[programId] = new Set();
            }
            dealerCountPerProgram[programId].add(dealer.dealerId);
        }
        
        // Sum total overdue amount across all relevant dealers, ensuring each dealer is only counted once.
        if (!processedDealersForOverdue.has(dealer.dealerId)) {
            totalOverdueAmount += limit?.principalOverdue || 0;
            processedDealersForOverdue.add(dealer.dealerId);
        }
    });

    // Set the final dealer counts for each program
    Object.keys(programAggregates).forEach(programId => {
        programAggregates[programId].totalDealers = dealerCountPerProgram[programId]?.size || 0;
    });
    
    // Aggregate invoice data using the pre-filtered invoices
    allInvoicesSnapshot.forEach(invoice => {
        if (programAggregates[invoice.programId]) {
            const prog = programAggregates[invoice.programId];
            prog.invoicesCount!++; // Total invoices for the program
            if ((invoice.overdueAmount ?? 0) > 0) {
                prog.overdueCount!++;
            }
            if (invoice.status === 'Disbursed') {
                prog.disbursedAmount! += invoice.amount;
                prog.disbursedInvoicesCount!++;
            }
            if (['Initiated', 'Approved', 'Sent to Lender'].includes(invoice.status)) {
                prog.pendingInvoicesCount!++;
            }
            if (invoice.status === 'Initiated') {
                prog.initiatedInvoicesCount!++;
            }
        }
    });

    const finalProgramList = Object.values(programAggregates)
        // Filter out programs that have no dealers associated with the current anchor
        .filter(p => p.totalDealers! > 0 || !anchorId);

    return { programs: finalProgramList, invoices: allInvoicesSnapshot, totalOverdueAmount };
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
    'Limit Live', 'On Hold', 'Queries Raised', 'Relook'
] as const;

export const leadStatuses: LeadStatus[] = ['Lead Created', 'Registered', 'KYC', 'Credit', 'Operations', 'PSD Completed', 'Dropped'];

export const leads: Lead[] = [
  { id: 'LEAD001', dealerName: 'New Age Retail', contactPerson: 'John Doe', contactEmail: 'john.d@newage.com', status: 'KYC', createdAt: '2024-07-15' },
  { id: 'LEAD002', dealerName: 'Mega Stores', contactPerson: 'Jane Smith', contactEmail: 'jane.s@megastores.com', status: 'Credit', createdAt: '2024-07-10' },
  { id: 'LEAD003', dealerName: 'The Corner Shop', contactPerson: 'Peter Jones', contactEmail: 'p.jones@cornershop.com', status: 'Lead Created', createdAt: '2024-07-20' },
  { id: 'LEAD004', dealerName: 'Daily Needs', contactPerson: 'Mary Johnson', contactEmail: 'mary.j@dailyneeds.com', status: 'PSD Completed', createdAt: '2024-06-25' },
  { id: 'LEAD005', dealerName: 'Value Mart', contactPerson: 'Chris Lee', contactEmail: 'chris.l@valuemart.com', status: 'Dropped', createdAt: '2024-07-05' },
];

export const invoiceStatuses: ['Initiated', 'Approved', 'Sent to Lender', 'Disbursed', 'Rejected', 'Repaid'] = ['Initiated', 'Approved', 'Sent to Lender', 'Disbursed', 'Rejected', 'Repaid'];

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
    

    



    


    

    













    
