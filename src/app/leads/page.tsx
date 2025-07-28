
import { unstable_noStore as noStore } from 'next/cache';
import { getSession } from "@/lib/session";
import { getMomentumDealerLeads } from "@/lib/data";
import LeadsClientPage from './client-page';

export default async function LeadsPage() {
  noStore();
  const session = await getSession();
  
  // If user is an anchor, use their leadExternalId to filter. Otherwise, fetch all leads.
  const anchorId = session?.roleType === 'Anchor' ? session?.leadExternalId : undefined;
  
  const momentumLeads = await getMomentumDealerLeads(anchorId);
  
  return (
    <>
      <LeadsClientPage initialLeads={momentumLeads} />
    </>
  );
}
