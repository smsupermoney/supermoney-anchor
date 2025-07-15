
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
  // This logic now needs all invoices, so we have to fetch them all
  // In a real app, this would be done with optimized queries or aggregated data
  const allInvoices = await getRecentInvoices(1000); // Assuming not more than 1000 invoices for now

  return (
    <DashboardClient 
      initialPrograms={programs} 
      initialInvoices={allInvoices}
    />
  );
}
