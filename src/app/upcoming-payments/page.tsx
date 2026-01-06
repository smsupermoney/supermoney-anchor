
import { unstable_noStore as noStore } from 'next/cache';
import PageHeader from "@/components/page-header";
import { getSession } from '@/lib/session';
import { getDealers } from '@/lib/data';
import { db1 } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import UpcomingPaymentsTable from './upcoming-payments-table';
import type { UpcomingPayment, Dealer, UpcomingPaymentItem } from '@/types';


async function getUpcomingPayments(anchorId?: string): Promise<UpcomingPaymentItem[]> {
    const paymentsCol = collection(db1, 'upcomingPayments');
    
    // First, get all dealers for the specific anchor, or all dealers if admin.
    const allDealersForScope = await getDealers(anchorId);
    const dealerMap = new Map(allDealersForScope.map(d => [d.id, { name: d.name, lender: d.lenderName }]));
    
    const dealerIdsForQuery = Array.from(dealerMap.keys());
    
    // If a non-admin user has no dealers, they have no payments to see.
    if (anchorId && dealerIdsForQuery.length === 0) {
        return [];
    }

    const paymentDocs = [];

    // If dealerIdsForQuery is not empty, fetch payments for those dealers.
    // If it IS empty (which can happen for an admin viewing an empty system), this loop is skipped.
    if (dealerIdsForQuery.length > 0) {
        // Firestore 'in' queries are limited to 30 items per query.
        // We must "chunk" the dealer IDs into groups of 30 to query them all.
        const CHUNK_SIZE = 30;
        for (let i = 0; i < dealerIdsForQuery.length; i += CHUNK_SIZE) {
            const chunk = dealerIdsForQuery.slice(i, i + CHUNK_SIZE);
            const q = query(paymentsCol, where('dealerId', 'in', chunk));
            const paymentSnapshots = await getDocs(q);
            paymentDocs.push(...paymentSnapshots.docs);
        }
    } else if (!anchorId) {
        // This is the admin case with no dealers in the system at all. Fetch all (zero) payments.
        const snapshot = await getDocs(paymentsCol);
        paymentDocs.push(...snapshot.docs);
    }
    
    const flattenedPayments: UpcomingPaymentItem[] = [];
    paymentDocs.forEach(doc => {
        const data = doc.data() as UpcomingPayment;
        const dealerInfo = dealerMap.get(data.dealerId);

        // This check is now robust. For an anchor, dealerInfo will only exist if the dealer is theirs.
        // For an admin, it will exist for all dealers fetched.
        if (dealerInfo && data.payments && Array.isArray(data.payments)) {
            data.payments.forEach(payment => {
                flattenedPayments.push({
                    id: `${data.dealerId}-${payment.dueDate}-${payment.outstandingAmount}`,
                    dealerId: data.dealerId,
                    dealerName: dealerInfo.name || 'Unknown Dealer',
                    outstandingAmount: payment.outstandingAmount,
                    dueDate: payment.dueDate,
                    lender: dealerInfo.lender || 'N/A'
                });
            });
        }
    });

    // Sort by due date
    flattenedPayments.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

    return flattenedPayments;
}


export default async function UpcomingPaymentsPage() {
  noStore();
  const session = await getSession();
  const isAdmin = session?.roleType === 'Admin';
  const anchorId = isAdmin ? undefined : session?.externalId;
  
  const upcomingPayments = await getUpcomingPayments(anchorId);
  
  return (
    <>
      <PageHeader title="Upcoming Payments" />
      <div className="mt-4">
        <UpcomingPaymentsTable 
            payments={upcomingPayments}
            isAdmin={isAdmin}
        />
      </div>
    </>
  );
}
