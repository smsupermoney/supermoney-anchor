
import { unstable_noStore as noStore } from 'next/cache';
import { getInvoices } from "@/lib/data";
import InvoicesClientPage from "./client-page";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions } from "@/lib/session";
import type { User } from "@/types";

export default async function InvoicesPage() {
  noStore();
  const session = await getIronSession<User>(cookies(), sessionOptions);
  const isAdmin = session.roleType === 'Admin';
  const anchorId = isAdmin ? undefined : session.externalId;

  const invoices = await getInvoices(anchorId);

  return <InvoicesClientPage initialInvoices={invoices} isAdmin={isAdmin} />;
}
