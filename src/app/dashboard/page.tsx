
import { unstable_noStore as noStore } from 'next/cache';
import DashboardClient from './client-page';
import { getPrograms, getDealers, getAnchorLeads } from '@/lib/data';
import { getSession } from '@/lib/session';

export default async function Dashboard() {
  noStore();
  const session = await getSession();
  const anchorId = session?.roleType === 'Admin' ? undefined : session?.externalId;
  
  const [{ programs, invoices }, dealers, anchorLeads] = await Promise.all([
    getPrograms(anchorId),
    getDealers(anchorId),
    getAnchorLeads(),
  ]);
  
  return (
    <DashboardClient 
      initialPrograms={programs} 
      initialInvoices={invoices}
      dealers={dealers}
      anchorLeads={anchorLeads}
    />
  );
}
