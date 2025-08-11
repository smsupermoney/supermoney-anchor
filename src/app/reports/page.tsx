
import { unstable_noStore as noStore } from 'next/cache';
import PageHeader from "@/components/page-header";
import { getSession } from '@/lib/session';
import { getInvoices, getDealers, getPrograms, getUsers } from '@/lib/data';
import ReportsClientPage from './client-page';

export default async function ReportsPage() {
  noStore();
  const session = await getSession();
  const anchorId = session?.roleType === 'Admin' ? undefined : session?.externalId;
  const isAdmin = session?.roleType === 'Admin';
  
  // Fetch all necessary data. The client component will handle filtering.
  const [invoices, dealers, { programs }, users] = await Promise.all([
    getInvoices(anchorId),
    getDealers(anchorId),
    getPrograms(anchorId),
    isAdmin ? getUsers() : Promise.resolve([])
  ]);
  
  return (
    <>
      <PageHeader title="Reports & Analytics" />
      <div className="mt-4">
        <ReportsClientPage
            initialInvoices={invoices}
            initialDealers={dealers}
            initialPrograms={programs}
            users={users}
            isAdmin={isAdmin}
        />
      </div>
    </>
  );
}
