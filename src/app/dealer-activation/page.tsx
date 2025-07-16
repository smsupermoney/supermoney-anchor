
import PageHeader from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DealerActivationPage() {
  return (
    <>
      <PageHeader title="Dealer Activation" />
      <Card className="mt-4">
        <CardHeader>
            <CardTitle>Ready for Activation</CardTitle>
            <CardDescription>Finalize onboarding and generate dealer codes.</CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground">Dealers ready for final activation will be listed here.</p>
        </CardContent>
      </Card>
    </>
  );
}
