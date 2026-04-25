
import { unstable_noStore as noStore } from 'next/cache';
import PageHeader from "@/components/page-header";
import { getSession } from '@/lib/session';
import { getDealers } from '@/lib/data';
import { db1 } from '@/lib/firebase';
import { collection, getDocs, query, where, collectionGroup } from 'firebase/firestore';
import UpcomingPaymentsTable from './upcoming-payments-table';
import type { UpcomingPayment, UpcomingPaymentLoan, UpcomingPaymentItem } from '@/types';
import UploadUpcomingPaymentsDialog from './upload-dialog';


async function getUpcomingPayments(anchorId?: string, region?: string): Promise<UpcomingPaymentItem[]> {
    noStore();
    
    // 1. Get the list of dealers this user is allowed to see.
    const allDealersForScope = await getDealers(anchorId, region);
    const dealerMap = new Map(allDealersForScope.map(d => [d.id, { name: d.name, lender: d.lenderName }]));
    
    const dealerIdsForQuery = Array.from(dealerMap.keys());
    
    // If a non-admin user has no dealers, they have no payments to see.
    if (anchorId && dealerIdsForQuery.length === 0) {
        return [];
    }

    const flattenedPayments: UpcomingPaymentItem[] = [];
    
    // 2. Query the 'loans' subcollection across all documents.
    const loansQuery = collectionGroup(db1, 'loans');
    const loansSnapshot = await getDocs(loansQuery);

    loansSnapshot.forEach(loanDoc => {
        const loanData = loanDoc.data() as UpcomingPaymentLoan;
        
        // The parent document's ID is the dealerId.
        const dealerId = loanDoc.ref.parent.parent?.id;

        // 3. Check if the current user has access to this dealer.
        // For admins, dealerMap contains all dealers. For anchors, it's pre-filtered.
        if (dealerId && dealerMap.has(dealerId)) {
            const dealerInfo = dealerMap.get(dealerId)!;
            flattenedPayments.push({
                id: loanDoc.id, // The loan document ID
                dealerId: dealerId,
                dealerName: dealerInfo.name || 'Unknown Dealer',
                outstandingAmount: loanData.outstandingAmount,
                dueDate: loanData.dueDate,
                lender: dealerInfo.lender || 'N/A'
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
  const isAdmin = session?.roleType === 'Admin' || session?.roleType === 'SuperMoney User';
  const anchorId = isAdmin ? undefined : session?.externalId;
  const region = isAdmin ? undefined : session?.region;
  
  const upcomingPayments = await getUpcomingPayments(anchorId, region);
  
  return (
    <>
      <PageHeader title="Upcoming Payments">
        {isAdmin && <UploadUpcomingPaymentsDialog />}
      </PageHeader>
      <div className="mt-4">
        <UpcomingPaymentsTable 
            payments={upcomingPayments}
            isAdmin={isAdmin}
        />
      </div>
    </>
  );
}
