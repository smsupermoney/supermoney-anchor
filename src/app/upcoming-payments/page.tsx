
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
    let paymentsQuery;

    if (anchorId) {
        // If anchorId is provided, we need to first get the dealers for that anchor
        const dealers = await getDealers(anchorId);
        const dealerIds = dealers.map(d => d.id);
        
        if (dealerIds.length === 0) {
            return [];
        }
        // Firestore 'in' queries are limited to 30 items. If there are more, we need to chunk.
        const chunks = [];
        for (let i = 0; i < dealerIds.length; i += 30) {
            chunks.push(dealerIds.slice(i, i + 30));
        }

        const paymentPromises = chunks.map(chunk => 
            getDocs(query(paymentsCol, where('dealerId', 'in', chunk)))
        );
        const paymentSnapshots = await Promise.all(paymentPromises);
        paymentsQuery = paymentSnapshots.flatMap(snap => snap.docs);

    } else {
        // Admin case, fetch all
        const snapshot = await getDocs(paymentsCol);
        paymentsQuery = snapshot.docs;
    }

    const allDealers = await getDealers();
    const dealerMap = new Map(allDealers.map(d => [d.id, d.name]));

    const flattenedPayments: UpcomingPaymentItem[] = [];
    paymentsQuery.forEach(doc => {
        const data = doc.data() as UpcomingPayment;
        if (data.payments && Array.isArray(data.payments)) {
            data.payments.forEach(payment => {
                flattenedPayments.push({
                    id: `${data.dealerId}-${payment.dueDate}-${payment.outstandingAmount}`, // Create a unique ID
                    dealerId: data.dealerId,
                    dealerName: dealerMap.get(data.dealerId) || 'Unknown Dealer',
                    outstandingAmount: payment.outstandingAmount,
                    dueDate: payment.dueDate,
                    lender: 'N/A' // This data is not in the upcomingPayments collection
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

