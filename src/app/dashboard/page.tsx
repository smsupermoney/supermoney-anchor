
import { unstable_noStore as noStore } from 'next/cache';
import DashboardClient from './client-page';
import { getPrograms, getDealers } from '@/lib/data';
import { getSession } from '@/lib/session';

export default async function Dashboard() {
  noStore();
  const session = await getSession();
  const anchorId = session?.roleType === 'Admin' ? undefined : session?.externalId;
  
  const [{ programs, invoices }, dealers] = await Promise.all([
    getPrograms(anchorId),
    getDealers(anchorId),
  ]);
  
  return (
    <DashboardClient 
      initialPrograms={programs} 
      initialInvoices={invoices}
      dealers={dealers}
    />
  );
}
