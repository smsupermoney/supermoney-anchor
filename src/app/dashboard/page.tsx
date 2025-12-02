
import { unstable_noStore as noStore } from 'next/cache';
import DashboardClient from './client-page';
import { getPrograms, getDealers, getMomentumDealerLeads } from '@/lib/data';
import { getSession } from '@/lib/session';

export default async function Dashboard() {
  noStore();
  const session = await getSession();
  
  // ID for programs, dealers, invoices
  const anchorId = session?.roleType === 'Admin' ? undefined : session?.externalId;
  const region = session?.roleType === 'Admin' ? undefined : session?.region;
  
  // Separate ID specifically for leads, as per recent changes
  const leadAnchorId = session?.roleType === 'Admin' ? undefined : session?.leadExternalId;

  // Fetch all data
  const { programs, invoices, totalOverdueAmount } = await getPrograms(anchorId, region);
  const [dealers, momentumLeads] = await Promise.all([
    getDealers(anchorId, region),
    (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID_2) ? getMomentumDealerLeads(leadAnchorId) : Promise.resolve([]),
  ]);
  
  const lifetimeSanctionLimit = dealers.reduce((sum, dealer) => sum + dealer.totalLimit, 0);
  
  return (
    <DashboardClient 
      initialPrograms={programs} 
      initialInvoices={invoices}
      initialDealers={dealers}
      momentumLeads={momentumLeads}
      totalOverdueAmount={totalOverdueAmount}
      lifetimeSanctionLimit={lifetimeSanctionLimit}
    />
  );
}

    