
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
    console.log(`[getMomentumDealerLeads] Fetching for anchorId: ${anchorId}`);
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
  return userSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as User));
}

export async function getInvoices(anchorId?: string, region?: string): Promise<Invoice[]> {
  let invoiceQuery;
  const invoicesCol = collection(db1, 'invoices');

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

  let dealers = allDealersSnapshot.docs.map(d => d.data() as Dealer);

  // Apply region filtering for dealers if a region is specified and it's not 'all'
  if (region && region !== 'all') {
      dealers = dealers.filter(dealer => dealer.region === region);
  }
  const visibleDealerIds = new Set(dealers.map(d => d.dealerId));

  const dealerMap = new Map(dealers.map(d => [d.dealerId, {name: d.dealerName, anchorId: d.anchorId}]));
  const programMap = new Map(programSnapshot.docs.map(p => [p.data().programId, p.data().lenderName]));
  
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set to the beginning of today

  const invoices = invoiceSnapshot.docs
    .map(doc => {
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
          invoiceImage: data.invoiceImage || '',
          disbursementSentDate: data.disbursementSentDate || '',
          disburseDate: data.disburseDate || '',
      } as Invoice;
    })
    .filter(invoice => {
        // If anchorId is provided, filter invoices to only those whose dealers are in the visible list
        if (anchorId) {
            return visibleDealerIds.has(invoice.dealerId);
        }
        // Admins see all invoices
        return true;
    });

  // Sort invoices by date in descending order (newest first)
  invoices.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return invoices;
}

export async function getDealers(anchorId?: string, region?: string): Promise<Dealer[]> {
    const dealersCol = collection(db1, 'dealers');
    let dealerQuery = query(dealersCol);

    if (anchorId) {
        dealerQuery = query(dealersCol, where('anchorId', '==', anchorId));
    }
    
    const [dealerSnapshot, limitsSnapshot, allInvoices, programSnapshot, usersSnapshot] = await Promise.all([
        getDocs(dealerQuery),
        getDocs(collection(db1, 'dealerLimits')),
        getInvoices(anchorId, region), // Pass region to get filtered invoices for accurate counts
        getDocs(collection(db1, 'programs')),
        getDocs(collection(db1, 'users')),
    ]);

    let dealersDocs = dealerSnapshot.docs;

    // Further filter by region if provided and not 'all'
    if (anchorId && region && region !== 'all') {
        dealersDocs = dealersDocs.filter(doc => doc.data().region === region);
    }
    
    if (dealersDocs.length === 0) {
        return [];
    }
    
    const limitsMap = new Map(limitsSnapshot.docs.map(doc => [doc.id, doc.data() as DealerLimit]));
    const programMap = new Map(programSnapshot.docs.map(p => [p.id, p.data().lenderName]));
    const userMap = new Map(usersSnapshot.docs.map(u => [u.id, u.data()]));

    const dealerList = dealersDocs.map(doc => {
        const dealerData = doc.data();
        const dealerId = dealerData.dealerId;
        const limitData = limitsMap.get(dealerId);
        
        const dealerInvoices = allInvoices.filter(i => i.dealerId === dealerId);
        
        // Match user by externalId which corresponds to dealerId
        const dealerUser = Array.from(userMap.values()).find(u => u.externalId === dealerId);

        const limitAmount = limitData?.limitAmount || 0;
        const utilisationAmount = limitData?.utilisationAmount || 0;
        
        return {
            id: dealerId,
            name: dealerData.dealerName,
            emailAddress: dealerUser?.emailAddress || '',
            phoneNumber: dealerUser?.phoneNumber || '',
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
            GST: dealerData?.GST,
            region: dealerData?.region
        } as Dealer;
    });

    return dealerList;
}


export async function getDealerLimits(dealerIds?: string[]): Promise<DealerLimit[]> {
    if (!dealerIds || dealerIds.length === 0) {
        return [];
    }

    const limitsCol = collection(db1, 'dealerLimits');
    const allLimits: DealerLimit[] = [];
    
    // Firestore 'in' query can handle up to 30 items.
    const CHUNK_SIZE = 30; 

    for (let i = 0; i < dealerIds.length; i += CHUNK_SIZE) {
        const chunk = dealerIds.slice(i, i + CHUNK_SIZE);
        if (chunk.length > 0) {
            const q = query(limitsCol, where(documentId(), 'in', chunk));
            const limitsSnapshot = await getDocs(q);
            const chunkLimits = limitsSnapshot.docs.map(doc => doc.data() as DealerLimit);
            allLimits.push(...chunkLimits);
        }
    }
    
    return allLimits;
}


export async function getPrograms(anchorId?: string, region?: string): Promise<{programs: Program[], invoices: Invoice[], totalOverdueAmount: number}> {
    const [programSnapshot, dealerSnapshot, limitsSnapshot, allInvoicesSnapshot] = await Promise.all([
        getDocs(collection(db1, 'programs')),
        getDocs(collection(db1, 'dealers')),
        getDocs(collection(db1, 'dealerLimits')),
        getInvoices(anchorId, region) // Pass region to get filtered invoices
    ]);

    const programMap = new Map(programSnapshot.docs.map(p => [p.id, { id: p.id, ...p.data() } as Program]));
    const limitsMap = new Map(limitsSnapshot.docs.map(l => [l.id, l.data() as DealerLimit]));
    
    let allDealers = dealerSnapshot.docs.map(d => d.data() as { dealerId: string, anchorId: string, programId: string, region?: string, status: Dealer['status'] });
    
    // Filter dealers based on anchor and region
    let relevantDealers = allDealers;
    if (anchorId) {
        relevantDealers = relevantDealers.filter(d => d.anchorId === anchorId);
        if (region && region !== 'all') {
            relevantDealers = relevantDealers.filter(d => d.region === region);
        }
    }
    
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

        // ** LOGIC CHANGE HERE **
        // Only aggregate limit and usage if the dealer is 'Active'
        if (programId && programAggregates[programId] && limit && dealer.status === 'Active') {
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
  const userData = userDoc.data();
  // Ensure the final object's 'id' is the Firestore document ID,
  // overwriting any 'id' field that might exist in the document data.
  return { ...userData, id: userDoc.id } as User;
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

    