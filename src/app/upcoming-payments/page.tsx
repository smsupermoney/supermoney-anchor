
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
    const allDealersForAnchor = await getDealers(anchorId);
    const dealerMap = new Map(allDealersForAnchor.map(d => [d.id, { name: d.name, lender: d.lenderName }]));
    
    let paymentDocsQuery;

    if (anchorId) {
        // If anchorId is provided, we only fetch payments for dealers belonging to that anchor.
        const dealerIds = Array.from(dealerMap.keys());
        
        if (dealerIds.length === 0) {
            return []; // Anchor has no dealers, so no payments to show.
        }

        // Firestore 'in' queries are limited to 30 items per query. 
        // We must "chunk" the dealer IDs into groups of 30 to query them all.
        const chunks: string[][] = [];
        for (let i = 0; i < dealerIds.length; i += 30) {
            chunks.push(dealerIds.slice(i, i + 30));
        }

        const paymentPromises = chunks.map(chunk => 
            getDocs(query(paymentsCol, where('dealerId', 'in', chunk)))
        );
        const paymentSnapshots = await Promise.all(paymentPromises);
        paymentDocsQuery = paymentSnapshots.flatMap(snap => snap.docs);

    } else {
        // Admin case: fetch all upcoming payments.
        const snapshot = await getDocs(paymentsCol);
        paymentDocsQuery = snapshot.docs;
    }

    const flattenedPayments: UpcomingPaymentItem[] = [];
    paymentDocsQuery.forEach(doc => {
        const data = doc.data() as UpcomingPayment;
        const dealerInfo = dealerMap.get(data.dealerId);

        // This check is important: only include the payment if its dealer is in the anchor's list.
        // For admins, dealerInfo will always exist if the dealer exists.
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
