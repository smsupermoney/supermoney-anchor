

import { getDealers } from "@/lib/data";
import RetailersClientPage from "./client-page";

export default async function DealersPage() {
  const dealers = await getDealers();

  return <RetailersClientPage initialDealers={dealers} />;
}
