import { unstable_noStore as noStore } from 'next/cache';
import PageHeader from "@/components/page-header";
import { getSession } from "@/lib/session";
import { getMomentumDealerLeads } from "@/lib/data";
import LeadsClientPage from './client-page';

export default async function LeadsPage() {
  noStore();
  const session = await getSession();
  const anchorId = session?.roleType === 'Admin' ? undefined : session?.externalId;
  
  const momentumLeads = await getMomentumDealerLeads(anchorId);
  
  return (
    <>
      <PageHeader title="Leads" />
      <div className='mt-4'>
        <LeadsClientPage initialLeads={momentumLeads} />
      </div>
    </>
  );
}
