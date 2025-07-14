
import PageHeader from '@/components/page-header';
import RiskAssessmentClient from '@/components/risk-assessment-client';
import { getDealers, getInvoices } from '@/lib/data';

export default async function RiskAssessmentPage() {
  const dealers = await getDealers();
  const allInvoices = await getInvoices();
  return (
    <>
      <PageHeader title="AI Risk Assessment" />
      <RiskAssessmentClient dealers={dealers} allInvoices={allInvoices} />
    </>
  );
}
