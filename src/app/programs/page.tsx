"use client";

import PageHeader from "@/components/page-header";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { programs } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import UploadInvoiceDialog from "@/components/upload-invoice-dialog";
import { UploadCloud } from "lucide-react";
import Link from "next/link";

export default function ProgramsPage() {
    const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', notation: 'compact' }).format(amount);

  return (
    <>
      <PageHeader title="Lender Programs" />
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {programs.map((program) => {
          const utilizationPercentage = (program.usedLimit / program.totalLimit) * 100;
          const remainingLimit = program.totalLimit - program.usedLimit;
          
          return (
            <Card key={program.id} className="flex flex-col">
              <CardHeader className="p-3">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-sm">{program.lenderName}</CardTitle>
                        <CardDescription>Total Limit: {formatCurrency(program.totalLimit)}</CardDescription>
                    </div>
                    <Badge variant={program.lenderType === 'Supermoney' ? 'default' : 'secondary'} className="text-xs">{program.lenderType}</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0 flex flex-col gap-2 p-3 flex-1">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium">Used: {formatCurrency(program.usedLimit)}</span>
                    <span className="text-muted-foreground">Available: {formatCurrency(remainingLimit)}</span>
                  </div>
                  <Progress value={utilizationPercentage} className="h-2" />
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                  <Link href={`/invoices?lender=${encodeURIComponent(program.lenderName)}`} className="space-y-1 hover:bg-secondary p-1 rounded-md transition-colors">
                      <p className="text-[10px] text-muted-foreground">Invoices</p>
                      <p className="font-semibold text-xs">{program.invoicesCount}</p>
                  </Link>
                   <div className="space-y-1 p-1 rounded-md">
                      <p className="text-[10px] text-muted-foreground">Disbursed</p>
                      <p className="font-semibold text-xs">{formatCurrency(program.disbursedAmount)}</p>
                  </div>
                  <Link href={`/retailers?lender=${encodeURIComponent(program.lenderName)}`} className="space-y-1 hover:bg-secondary p-1 rounded-md transition-colors">
                      <p className="text-[10px] text-muted-foreground">Total Dealers</p>
                      <p className="font-semibold text-xs">{program.totalDealers}</p>
                  </Link>
                  <div className="space-y-1 p-1 rounded-md">
                      <p className="text-[10px] text-muted-foreground">Total Overdue</p>
                      <p className="font-semibold text-xs">{program.overdueCount}</p>
                  </div>
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
