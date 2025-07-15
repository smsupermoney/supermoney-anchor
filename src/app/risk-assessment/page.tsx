
import { unstable_noStore as noStore } from 'next/cache';
import PageHeader from '@/components/page-header';
import RiskAssessmentClient from '@/components/risk-assessment-client';
import { getDealers, getInvoices } from '@/lib/data';
import { getSession } from '@/lib/session';

export default async function RiskAssessmentPage() {
  noStore();
  const session = await getSession();
  const anchorId = session?.roleType === 'Admin' ? undefined : session?.externalId;

  const dealers = await getDealers(anchorId);
  const allInvoices = await getInvoices(anchorId);
  
  return (
    <>
      <PageHeader title="AI Risk Assessment" />
      <RiskAssessmentClient dealers={dealers} allInvoices={allInvoices} />
    </>
  );
}
