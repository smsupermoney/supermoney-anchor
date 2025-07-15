
import { unstable_noStore as noStore } from 'next/cache';
import DashboardClient from './client-page';
import { getPrograms } from '@/lib/data';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions } from '@/lib/session';
import type { User } from '@/types';

export default async function Dashboard() {
  noStore();
  const session = await getIronSession<User>(cookies(), sessionOptions);
  const anchorId = session.roleType === 'Admin' ? undefined : session.externalId;
  
  const { programs, invoices } = await getPrograms(anchorId);
  
  return (
    <DashboardClient 
      initialPrograms={programs} 
      initialInvoices={invoices}
    />
  );
}
