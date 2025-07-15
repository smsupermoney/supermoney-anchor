
import DashboardClient from './client-page';
import { getPrograms, getInvoices } from '@/lib/data';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions } from '@/lib/session';
import type { User } from '@/types';

export default async function Dashboard() {
  const session = await getIronSession<User>(cookies(), sessionOptions);
  const anchorId = session.externalId;

  // Fetch all data needed for the dashboard in one go.
  const { programs, invoices } = await getPrograms(anchorId);
  
  return (
    <DashboardClient 
      initialPrograms={programs} 
      initialInvoices={invoices}
    />
  );
}
