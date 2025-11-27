
"use server"

import { unstable_noStore as noStore } from 'next/cache';
import { getPrograms, getUsers, getDealers } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import UploadInvoiceDialog from "@/components/upload-invoice-dialog";
import { UploadCloud } from "lucide-react";
import Link from "next/link";
import PageHeader from "@/components/page-header";
import { getSession } from "@/lib/session";
import type { User, Dealer } from '@/types';
import ProgramsTable from './programs-table';

export default async function ProgramsPage() {
    noStore();
    const session = await getSession();
    const isAdmin = session?.roleType === 'Admin';
    const anchorId = isAdmin ? undefined : session?.externalId;
    const region = isAdmin ? undefined : session?.region;

    const [{ programs }, allUsers, dealers] = await Promise.all([
      getPrograms(anchorId, region),
      isAdmin ? getUsers() : Promise.resolve([] as User[]),
      getDealers(anchorId, region)
    ]);
    
    const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', notation: 'compact' }).format(amount);
    
    const anchorUserMap = new Map(allUsers.filter(u => u.roleType === 'Anchor').map(u => [u.externalId, u.userName]));

  if (isAdmin) {
    const allDealers = await getDealers(undefined, undefined);
    const programsWithAnchors = programs.map(program => {
        const relevantDealerAnchorIds = new Set(allDealers.filter(d => d.programId === program.id).map(d => d.anchorId));
        const anchorNames = Array.from(relevantDealerAnchorIds).map(id => anchorUserMap.get(id) || id);
        return { ...program, anchorNames };
    });

    return (
        <>
            <PageHeader title="Lender Programs" />
            <Card className="mt-4">
                <CardHeader>
                    <CardTitle>All Programs</CardTitle>
                    <CardDescription>A list of all financing programs in the system.</CardDescription>
                </CardHeader>
                <CardContent>
                   <ProgramsTable programs={programsWithAnchors} />
                </CardContent>
            </Card>
        </>
    );
  }

  // Anchor view
  return (
    <>
      <PageHeader title="Lender Programs" />
      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
        {programs.map((program) => {
          console.log(program, "yash")
          const utilizationPercentage = (program.totalLimit && program.totalLimit > 0) ? ((program.usedLimit || 0) / program.totalLimit) * 100 : 0;
          const remainingLimit = (program.totalLimit || 0) - (program.usedLimit || 0);

          return (
            <Card key={program.id} className="flex flex-col">
              <CardHeader className="p-3 pb-2">
                <div className="flex justify-between items-start">
                  <div className="min-w-0">
                    <TooltipProvider>
                        <Tooltip>
                        <TooltipTrigger asChild>
                            <CardTitle className="text-sm truncate">{program.shortName || program.lenderName}</CardTitle>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{program.lenderName}</p>
                        </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    <CardDescription className="text-xs">Total Limit: {formatCurrency(program.totalLimit || 0)}</CardDescription>
                  </div>
                  <Badge variant={program.lenderType === 'Supermoney' ? 'default' : 'secondary'} className="text-xs shrink-0">{program.lenderType}</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-3 pt-0 flex flex-col gap-2 flex-1">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium">Used: {formatCurrency(program.usedLimit || 0)}</span>
                    <span className="text-muted-foreground">Available: {formatCurrency(remainingLimit)}</span>
                  </div>
                  <Progress value={utilizationPercentage} className="h-2" />
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                  <Link href={`/invoices?lender=${encodeURIComponent(program.lenderName)}&status=Disbursed`} className="space-y-0 hover:bg-secondary p-1 rounded-md transition-colors">
                      <p className="text-[10px] text-muted-foreground">Disbursed Invoices</p>
                      <p className="font-semibold text-xs">{program.disbursedInvoicesCount}</p>
                  </Link>
                  <Link href={`/invoices?lender=${encodeURIComponent(program.lenderName)}&status=Initiated`} className="space-y-0 hover:bg-secondary p-1 rounded-md transition-colors">
                    <p className="text-[10px] text-muted-foreground">Initiated Invoices</p>
                    <p className="font-semibold text-xs">{program.initiatedInvoicesCount}</p>
                  </Link>
                  <Link href={`/dealers?lender=${encodeURIComponent(program.lenderName)}`} className="space-y-0 hover:bg-secondary p-1 rounded-md transition-colors">
                      <p className="text-[10px] text-muted-foreground">Total Dealers</p>
                      <p className="font-semibold text-xs">{program.totalDealers}</p>
                  </Link>
                  <Link href={`/invoices?lender=${encodeURIComponent(program.lenderName)}&overdue=yes`} className="space-y-0 hover:bg-secondary p-1 rounded-md transition-colors">
                      <p className="text-[10px] text-muted-foreground">Overdue Invoices</p>
                      <p className="font-semibold text-xs text-destructive">{program.overdueCount}</p>
                  </Link>
                </div>
              </CardContent>
              <CardFooter className="p-3 pt-0">
                  <UploadInvoiceDialog dealers={dealers} defaultLender={program.lenderName}>
                    <Button variant="outline" size="sm" className="w-full hover:bg-primary hover:text-primary-foreground">
                      <UploadCloud className="mr-2 h-4 w-4" />
                      Raise Invoice
                    </Button>
                  </UploadInvoiceDialog>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </>
  );
}
