
import { getDealers } from "@/lib/data";
import RetailersClientPage from "./client-page";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions } from "@/lib/session";
import type { User } from "@/types";

export default async function DealersPage() {
  const dealers = await getDealers();
  const session = await getIronSession<User>(cookies(), sessionOptions);
  const isAdmin = session.roleType === 'Admin';

  return <RetailersClientPage initialDealers={dealers} isAdmin={isAdmin} />;
}
