
import PageHeader from '@/components/page-header';
import RiskAssessmentClient from '@/components/risk-assessment-client';
import { getDealers, getInvoices } from '@/lib/data';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions } from '@/lib/session';
import type { User } from '@/types';

export default async function RiskAssessmentPage() {
  const session = await getIronSession<User>(cookies(), sessionOptions);
  const anchorId = session.externalId;
  const isAdmin = session.roleType === 'Admin';

  const dealers = await getDealers(isAdmin ? undefined : anchorId);
  const allInvoices = await getInvoices(isAdmin ? undefined : anchorId);
  
  return (
    <>
      <PageHeader title="AI Risk Assessment" />
      <RiskAssessmentClient dealers={dealers} allInvoices={allInvoices} />
    </>
  );
}
