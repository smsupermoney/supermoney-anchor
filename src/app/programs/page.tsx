
import { getPrograms } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import UploadInvoiceDialog from "@/components/upload-invoice-dialog";
import { PlusCircle, Upload, UploadCloud } from "lucide-react";
import Link from "next/link";
import PageHeader from "@/components/page-header";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions } from "@/lib/session";
import type { User } from "@/types";

export default async function ProgramsPage() {
    const session = await getIronSession<User>(cookies(), sessionOptions);
    const isAdmin = session.roleType === 'Admin';
    const anchorId = isAdmin ? undefined : session.externalId;

    const { programs } = await getPrograms(anchorId);
    
    const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', notation: 'compact' }).format(amount);
    
    const lenderFullNameMapping: Record<string, string> = {
        'CHOLAMANDALAM INVEST...': 'CHOLAMANDALAM INVESTMENT AND FINANCE COMPANY LIMITED',
        'ADITYA BIRLA CAPITAL LTD': 'ADITYA BIRLA CAPITAL LTD',
        'Supply Chain Finance Co.': 'Supply Chain Finance Co.',
        'Flexi Loans': 'Flexi Loans',
        'Supermoney Finance': 'Supermoney Finance'
    };

  return (
    <>
      <PageHeader title="Lender Programs">
        {isAdmin && (
            <div className="flex gap-2">
                <Button variant="outline">
                    <Upload className="mr-2 h-4 w-4"/>
                    Upload Excel
                </Button>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4"/>
                    Add Program
                </Button>
            </div>
        )}
      </PageHeader>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
        {programs.map((program) => {
          const utilizationPercentage = (program.usedLimit && program.totalLimit) ? (program.usedLimit / program.totalLimit) * 100 : 0;
          const remainingLimit = (program.totalLimit || 0) - (program.usedLimit || 0);
          const fullName = lenderFullNameMapping[program.lenderName] || program.lenderName;

          return (
            <Card key={program.id} className="flex flex-col">
              <CardHeader className="p-3 pb-2">
                <div className="flex justify-between items-start">
                  <div className="min-w-0">
                    <TooltipProvider>
                        <Tooltip>
                        <TooltipTrigger asChild>
                            <CardTitle className="text-sm truncate">{program.lenderName}</CardTitle>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{fullName}</p>
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
                      <p className="font-semibold text-xs">{program.invoicesCount}</p>
                  </Link>
                  <Link href={`/invoices?lender=${encodeURIComponent(program.lenderName)}&status=Initiated`} className="space-y-0 hover:bg-secondary p-1 rounded-md transition-colors">
                    <p className="text-[10px] text-muted-foreground">Initiated Invoices</p>
                    <p className="font-semibold text-xs">{program.pendingInvoicesCount}</p>
                  </Link>
                  <Link href={`/retailers?lender=${encodeURIComponent(program.lenderName)}`} className="space-y-0 hover:bg-secondary p-1 rounded-md transition-colors">
                      <p className="text-[10px] text-muted-foreground">Total Dealers</p>
                      <p className="font-semibold text-xs">{program.totalDealers}</p>
                  </Link>
                  <Link href={`/invoices?lender=${encodeURIComponent(program.lenderName)}&overdue=yes`} className="space-y-0 hover:bg-secondary p-1 rounded-md transition-colors">
                      <p className="text-[10px] text-muted-foreground">Overdue Invoices</p>
                      <p className="font-semibold text-xs">{program.overdueCount}</p>
                  </Link>
                </div>
              </CardContent>
              <CardFooter className="p-3 pt-0">
                  <UploadInvoiceDialog defaultLender={program.lenderName}>
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
