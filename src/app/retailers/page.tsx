
import { unstable_noStore as noStore } from 'next/cache';
import { getDealers } from "@/lib/data";
import RetailersClientPage from "./client-page";
import { getSession } from "@/lib/session";

export default async function DealersPage() {
  noStore();
  const session = await getSession();
  const isAdmin = session?.roleType === 'Admin';
  const anchorId = isAdmin ? undefined : session?.externalId;
  
  const dealers = await getDealers(anchorId);

  return <RetailersClientPage initialDealers={dealers} isAdmin={isAdmin} />;
}
