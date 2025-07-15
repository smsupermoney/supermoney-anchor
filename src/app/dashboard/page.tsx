
import DashboardClient from './client-page';
import { getPrograms, getRecentInvoices } from '@/lib/data';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions } from '@/lib/session';
import type { User } from '@/types';
import { subDays } from 'date-fns';

export default async function Dashboard() {
  const session = await getIronSession<User>(cookies(), sessionOptions);
  const anchorId = session.externalId;

  const programs = await getPrograms(anchorId);
  // Fetch invoices specifically for the programs associated with the logged-in anchor.
  const allInvoices = await getRecentInvoices(undefined, anchorId);

  return (
    <DashboardClient 
      initialPrograms={programs} 
      initialInvoices={allInvoices}
    />
  );
}
