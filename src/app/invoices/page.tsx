
import { unstable_noStore as noStore } from 'next/cache';
import { getInvoices } from "@/lib/data";
import InvoicesClientPage from "./client-page";
import { getSession } from "@/lib/session";
import type { User } from "@/types";

export default async function InvoicesPage() {
  noStore();
  const session = await getSession();
  const isAdmin = session?.roleType === 'Admin';
  const anchorId = isAdmin ? undefined : session?.externalId;

  const invoices = await getInvoices(anchorId);

  return <InvoicesClientPage initialInvoices={invoices} isAdmin={isAdmin} />;
}
