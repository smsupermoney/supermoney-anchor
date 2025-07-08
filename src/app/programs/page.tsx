import PageHeader from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { lenders, invoices } from "@/lib/data";
import { Badge } from "@/components/ui/badge";

export default function ProgramsPage() {
    const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', notation: 'compact' }).format(amount);

  return (
    <>
      <PageHeader title="Lender Programs" />
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lenders.map((lender) => {
          const lenderUtilized = invoices.filter(i => lender.programs.some(p => p.id === i.programId)).reduce((sum, i) => sum + i.amount, 0);
          const utilizationPercentage = (lenderUtilized / lender.totalLimit) * 100;
          const remainingLimit = lender.totalLimit - lenderUtilized;
          
          return (
            <Card key={lender.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle>{lender.name}</CardTitle>
                        <CardDescription>Total Limit: {formatCurrency(lender.totalLimit)}</CardDescription>
                    </div>
                    <Badge variant={lender.limitType === 'Fungible' ? 'default' : 'secondary'} className="text-xs">{lender.limitType}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium">Used: {formatCurrency(lenderUtilized)}</span>
                      <span className="text-muted-foreground">Available: {formatCurrency(remainingLimit)}</span>
                    </div>
                    <Progress value={utilizationPercentage} className="h-2" />
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground">Associated Programs:</p>
                    <div className="flex flex-wrap gap-2">
                      {lender.programs.map(p => (
                        <Badge key={p.id} variant="outline">{p.name}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );
}
