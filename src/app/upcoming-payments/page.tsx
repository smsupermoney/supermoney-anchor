
import { unstable_noStore as noStore } from 'next/cache';
import PageHeader from "@/components/page-header";
import { getSession } from '@/lib/session';
import { getInvoices, getUsers } from '@/lib/data';
import UpcomingPaymentsTable from './upcoming-payments-table';

export default async function UpcomingPaymentsPage() {
  noStore();
  const session = await getSession();
  const isAdmin = session?.roleType === 'Admin';
  const anchorId = isAdmin ? undefined : session?.externalId;
  const region = isAdmin ? undefined : session?.region;

  // Fetch invoices that are due in the future and have been disbursed
  const allInvoices = await getInvoices(anchorId, region);
  const upcomingInvoices = allInvoices.filter(invoice => {
    const dueDate = new Date(invoice.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Compare dates only
    return invoice.status === 'Disbursed' && dueDate >= today;
  });

  // If admin, enrich with anchor names
  if (isAdmin) {
    const allUsers = await getUsers();
    const anchorUserMap = new Map(allUsers.filter(u => u.roleType === 'Anchor').map(u => [u.externalId, u.userName]));
    upcomingInvoices.forEach(invoice => {
      invoice.anchorName = anchorUserMap.get(invoice.anchorId) || invoice.anchorId;
    });
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
