

import { getInvoices } from "@/lib/data";
import InvoicesClientPage from "./client-page";

export default async function InvoicesPage() {
  const invoices = await getInvoices();

  return <InvoicesClientPage initialInvoices={invoices} />;
}
