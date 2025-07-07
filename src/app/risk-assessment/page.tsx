import PageHeader from '@/components/page-header';
import RiskAssessmentClient from '@/components/risk-assessment-client';
import { retailers, invoices } from '@/lib/data';

export default function RiskAssessmentPage() {
  return (
    <>
      <PageHeader title="AI Risk Assessment" />
      <RiskAssessmentClient retailers={retailers} allInvoices={invoices} />
    </>
  );
}
