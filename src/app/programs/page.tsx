import PageHeader from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { programs } from "@/lib/data";

export default function ProgramsPage() {
    const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact' }).format(amount);

  return (
    <>
      <PageHeader title="Lender Programs" />
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {programs.map((program) => {
          const utilizationPercentage = (program.usedLimit / program.totalLimit) * 100;
          const remainingLimit = program.totalLimit - program.usedLimit;
          
          return (
            <Card key={program.id}>
              <CardHeader>
                <CardTitle>{program.lenderName}</CardTitle>
                <CardDescription>Total Limit: {formatCurrency(program.totalLimit)}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">Used: {formatCurrency(program.usedLimit)}</span>
                      <span className="text-muted-foreground">Available: {formatCurrency(remainingLimit)}</span>
                    </div>
                    <Progress value={utilizationPercentage} className="h-2" />
                  </div>
                  <Separator />
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-1">
                        <p className="text-muted-foreground">Invoices</p>
                        <p className="font-semibold text-lg">{program.invoicesCount}</p>
                    </div>
                     <div className="space-y-1">
                        <p className="text-muted-foreground">Disbursed</p>
                        <p className="font-semibold text-lg">{formatCurrency(program.disbursedAmount)}</p>
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
