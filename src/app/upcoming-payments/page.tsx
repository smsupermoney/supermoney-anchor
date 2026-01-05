
import { unstable_noStore as noStore } from 'next/cache';
import PageHeader from "@/components/page-header";
import { getSession } from '@/lib/session';
import { getInvoices, getUsers, getDealers } from '@/lib/data';
import UpcomingPaymentsTable from './upcoming-payments-table';

export default async function UpcomingPaymentsPage() {
  noStore();
  const session = await getSession();
  const isAdmin = session?.roleType === 'Admin';
  const anchorId = isAdmin ? undefined : session?.externalId;
  const region = isAdmin ? undefined : session?.region;

  // Fetch all invoices that could be upcoming payments
  const allInvoices = await getInvoices(anchorId, region);

  let upcomingInvoices = allInvoices.filter(invoice => {
    const dueDate = new Date(invoice.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Compare dates only
    return invoice.status === 'Disbursed' && dueDate >= today;
  });

  // If the user is an admin, enrich the invoices with anchor names.
  // If not an admin, the invoices are already scoped by getInvoices, but we re-verify here.
  if (isAdmin) {
    const allUsers = await getUsers();
    const anchorUserMap = new Map(allUsers.filter(u => u.roleType === 'Anchor').map(u => [u.externalId, u.userName]));
    upcomingInvoices.forEach(invoice => {
      invoice.anchorName = anchorUserMap.get(invoice.anchorId) || invoice.anchorId;
    });
  } else if (anchorId) {
    // For a non-admin, ensure we only show payments for their dealers.
    // 1. Get all dealers for this anchor.
    const anchorDealers = await getDealers(anchorId, region);
    const anchorDealerIds = new Set(anchorDealers.map(d => d.id));
    
    // 2. Filter the upcoming invoices to only those whose dealerId is in the anchor's list.
    upcomingInvoices = upcomingInvoices.filter(invoice => anchorDealerIds.has(invoice.dealerId));
  }


  return (
    <>
      <PageHeader title="Upcoming Payments" />
      <div className="mt-4">
        <UpcomingPaymentsTable 
            invoices={upcomingInvoices}
            isAdmin={isAdmin}
        />
      </div>
    </>
  );
}
