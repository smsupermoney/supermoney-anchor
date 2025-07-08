"use client";

import { useFormStatus } from "react-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { generateDealerRiskAssessment } from "@/app/risk-assessment/actions";
import { AlertCircle, Bot, Zap } from "lucide-react";
import { Progress } from "./ui/progress";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { useActionState, useState } from "react";
import type { Invoice, Dealer } from "@/types";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full md:w-auto">
      {pending ? "Analyzing..." : "Assess Risk"}
      <Zap className="ml-2 h-4 w-4" />
    </Button>
  );
}

type RiskAssessmentClientProps = {
    dealers: Dealer[];
    allInvoices: Invoice[];
};

export default function RiskAssessmentClient({ dealers }: RiskAssessmentClientProps) {
  const initialState = { message: "", error: false };
  const [state, formAction] = useActionState(generateDealerRiskAssessment, initialState);
  const [selectedDealerId, setSelectedDealerId] = useState<string>("");

  const riskScoreColor = (score: number) => {
    if (score <= 33) return "text-accent"; // Green
    if (score <= 66) return "text-yellow-500";
    return "text-destructive";
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Select Dealer</CardTitle>
          <CardDescription>
            Choose a dealer to generate an AI-powered risk assessment based on their invoice history.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="flex flex-col md:flex-row gap-4 items-end">
            <div className="w-full md:w-1/3">
              <Select name="dealerId" required value={selectedDealerId} onValueChange={setSelectedDealerId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a dealer..." />
                </SelectTrigger>
                <SelectContent>
                  {dealers.map((dealer) => (
                    <SelectItem key={dealer.id} value={dealer.id}>
                      {dealer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <SubmitButton />
          </form>
        </CardContent>
      </Card>

      {state.error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}

      {state.data && (
        <div className="grid md:grid-cols-3 gap-6">
            <Card className="md:col-span-1">
                <CardHeader>
                    <CardTitle>Risk Score</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                    <div className="relative">
                        <p className={`text-7xl font-bold ${riskScoreColor(state.data.riskScore)}`}>
                            {state.data.riskScore}
                        </p>
                        <p className="text-xs text-muted-foreground">out of 100</p>
                    </div>
                    <Progress value={state.data.riskScore} className="mt-4 h-3" />
                </CardContent>
            </Card>
            <Card className="md:col-span-2">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Bot className="h-5 w-5 text-primary" /> AI Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <h3 className="font-semibold mb-1 text-xs">Key Risk Factors</h3>
                        <p className="text-xs text-muted-foreground">{state.data.riskFactors}</p>
                    </div>
                     <div>
                        <h3 className="font-semibold mb-1 text-xs">Recommendations</h3>
                        <p className="text-xs text-muted-foreground">{state.data.recommendations}</p>
                    </div>
                </CardContent>
            </Card>
        </div>
      )}
    </div>
  );
}
