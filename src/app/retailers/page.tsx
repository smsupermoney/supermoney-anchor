
import { unstable_noStore as noStore } from 'next/cache';
import { getDealers, getUsers } from "@/lib/data";
import RetailersClientPage from "./client-page";
import { getSession } from "@/lib/session";
import type { User } from '@/types';


export default async function DealersPage() {
  noStore();
  const session = await getSession();
  const isAdmin = session?.roleType === 'Admin';
  const anchorId = isAdmin ? undefined : session?.externalId;
  const region = isAdmin ? undefined : session?.region;
  
  let dealers = await getDealers(anchorId, region);

  if (isAdmin) {
    const allUsers = await getUsers();
    const anchorUserMap = new Map(allUsers.filter(u => u.roleType === 'Anchor').map(u => [u.externalId, u.userName]));
    dealers = dealers.map(dealer => ({
      ...dealer,
      anchorName: anchorUserMap.get(dealer.anchorId) || dealer.anchorId
    }));
  }


  return <RetailersClientPage initialDealers={dealers} isAdmin={isAdmin} />;
}
