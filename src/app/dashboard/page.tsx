
import { unstable_noStore as noStore } from 'next/cache';
import DashboardClient from './client-page';
import { getPrograms, getDealers, getMomentumDealerLeads } from '@/lib/data';
import { getSession } from '@/lib/session';

export default async function Dashboard() {
  noStore();
  const session = await getSession();
  const anchorId = session?.roleType === 'Admin' ? undefined : session?.externalId;
  
  const [{ programs, invoices, totalOverdueAmount }, dealers, momentumLeads] = await Promise.all([
    getPrograms(anchorId),
    getDealers(anchorId),
    getMomentumDealerLeads(anchorId),
  ]);
  
  return (
    <DashboardClient 
      initialPrograms={programs} 
      initialInvoices={invoices}
      dealers={dealers}
      momentumLeads={momentumLeads}
      totalOverdueAmount={totalOverdueAmount}
    />
  );
}
