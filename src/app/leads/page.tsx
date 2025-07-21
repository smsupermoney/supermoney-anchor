
import { unstable_noStore as noStore } from 'next/cache';
import PageHeader from "@/components/page-header";
import { getSession } from "@/lib/session";
import { getMomentumDealerLeads } from "@/lib/data";
import LeadsClientPage from './client-page';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle, Upload } from 'lucide-react';

export default async function LeadsPage() {
  noStore();
  const session = await getSession();
  const anchorId = session?.roleType === 'Admin' ? undefined : session?.externalId;
  
  const momentumLeads = await getMomentumDealerLeads(anchorId);
  
  return (
    <>
      <PageHeader title="All Leads">
        <div className="flex items-center gap-2">
            <Button asChild variant="outline">
                <Link href="/add-leads-bulk">
                    <Upload className="mr-2 h-4 w-4"/>
                    Bulk Lead Upload
                </Link>
            </Button>
            <Button asChild>
                <Link href="/add-lead">
                    <PlusCircle className="mr-2 h-4 w-4"/>
                    Add Lead
                </Link>
            </Button>
        </div>
      </PageHeader>
      <div className='mt-4'>
        <LeadsClientPage initialLeads={momentumLeads} />
      </div>
    </>
  );
}
