
import DashboardClient from './client-page';
import { getPrograms, getInvoices } from '@/lib/data';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions } from '@/lib/session';
import type { User } from '@/types';

export default async function Dashboard() {
  const session = await getIronSession<User>(cookies(), sessionOptions);
  const anchorId = session.roleType === 'Admin' ? undefined : session.externalId;

  // Fetch programs and invoices separately, filtered by the anchor.
  const { programs } = await getPrograms(anchorId);
  const invoices = await getInvoices(anchorId);
  
  return (
    <DashboardClient 
      initialPrograms={programs} 
      initialInvoices={invoices}
    />
  );
}
