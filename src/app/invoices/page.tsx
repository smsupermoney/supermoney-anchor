
import { unstable_noStore as noStore } from 'next/cache';
import { getInvoices, getUsers } from "@/lib/data";
import InvoicesClientPage from "./client-page";
import { getSession } from "@/lib/session";
import type { User } from "@/types";

export default async function InvoicesPage() {
  noStore();
  const session = await getSession();
  const isAdmin = session?.roleType === 'Admin';
  const anchorId = isAdmin ? undefined : session?.externalId;

  let invoices = await getInvoices(anchorId);

  if (isAdmin) {
    const allUsers = await getUsers();
    const anchorUserMap = new Map(allUsers.filter(u => u.roleType === 'Anchor').map(u => [u.externalId, u.userName]));
    invoices = invoices.map(invoice => ({
      ...invoice,
      anchorName: anchorUserMap.get(invoice.anchorId) || invoice.anchorId
    }));
  }

  return <InvoicesClientPage initialInvoices={invoices} isAdmin={isAdmin} />;
}
