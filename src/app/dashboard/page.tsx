
import { unstable_noStore as noStore } from 'next/cache';
import DashboardClient from './client-page';
import { getPrograms } from '@/lib/data';
import { getSession } from '@/lib/session';

export default async function Dashboard() {
  noStore();
  const session = await getSession();
  console.log(JSON.stringify(session));
  const anchorId = session?.roleType === 'Admin' ? undefined : session?.externalId;
  
  const { programs, invoices } = await getPrograms(anchorId);
  
  return (
    <DashboardClient 
      initialPrograms={programs} 
      initialInvoices={invoices}
    />
  );
}
