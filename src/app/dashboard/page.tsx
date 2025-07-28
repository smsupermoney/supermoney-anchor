
import { unstable_noStore as noStore } from 'next/cache';
import DashboardClient from './client-page';
import { getPrograms, getDealers, getMomentumDealerLeads } from '@/lib/data';
import { getSession } from '@/lib/session';

export default async function Dashboard() {
  noStore();
  const session = await getSession();
  
  // ID for programs, dealers, invoices
  const anchorId = session?.roleType === 'Admin' ? undefined : session?.externalId;
  
  // Separate ID specifically for leads, as per recent changes
  const leadAnchorId = session?.roleType === 'Admin' ? undefined : session?.leadExternalId;
  
  const [{ programs, invoices, totalOverdueAmount }, dealers, momentumLeads] = await Promise.all([
    getPrograms(anchorId),
    getDealers(anchorId),
    getMomentumDealerLeads(leadAnchorId), // Use the correct ID for fetching leads
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
