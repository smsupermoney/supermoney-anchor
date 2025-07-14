

import { getInvoices } from "@/lib/data";
import InvoicesClientPage from "./client-page";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions } from "@/lib/session";
import type { User } from "@/types";

export default async function InvoicesPage() {
  const invoices = await getInvoices();
  const session = await getIronSession<User>(cookies(), sessionOptions);
  const isAdmin = session.roleType === 'Admin';

  return <InvoicesClientPage initialInvoices={invoices} isAdmin={isAdmin} />;
}
