
import DashboardClient from './client-page';
import { getPrograms, getRecentInvoices } from '@/lib/data';
import { subDays } from 'date-fns';

export default async function Dashboard() {
  const programs = await getPrograms();
  const recentInvoices = await getRecentInvoices(10);
  
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
