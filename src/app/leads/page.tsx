
import { unstable_noStore as noStore } from 'next/cache';
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
      <LeadsClientPage initialLeads={momentumLeads} />
    </>
  );
}
