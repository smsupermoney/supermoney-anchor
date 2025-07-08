
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, CheckCircle, ShieldCheck, ThumbsDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function CreditReportManager() {
  const [isFetching, setIsFetching] = useState(false);
  const [report, setReport] = useState<any>(null);

  const handleFetchReport = () => {
    setIsFetching(true);
    // Simulate API call
    setTimeout(() => {
      setReport({
        score: 780,
        summary: "Partner has a strong credit history with no defaults in the last 36 months. Active trade lines show consistent payment behavior. One minor late payment reported 2 years ago on a small loan.",
        recommendation: "Good Fit",
        recommendationReason: "The partner's high credit score and clean payment record indicate low financial risk. They are a suitable candidate for onboarding."
      });
      setIsFetching(false);
    }, 2500);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Credit Bureau Analysis</CardTitle>
        <CardDescription>Fetch a CIBIL/Credit Bureau report for underwriting.</CardDescription>
      </CardHeader>
      <CardContent>
        {!report && !isFetching && (
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="outline" className="w-full">Fetch Credit Report</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Confirm Action</AlertDialogTitle>
                    <AlertDialogDescription>
                        Fetching a credit report incurs additional charges. This action will be logged for auditing. Do you want to proceed?
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleFetchReport}>Proceed</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        )}

        {isFetching && (
            <div className="space-y-4">
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
            </div>
        )}

        {report && (
            <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 rounded-lg bg-secondary">
                    <ShieldCheck className="h-8 w-8 text-primary mt-1" />
                    <div>
                        <p className="font-bold">Credit Score: {report.score}</p>
                        <p className="text-xs text-muted-foreground">Score is high, indicating strong creditworthiness.</p>
                    </div>
                </div>
                <div className="space-y-2">
                     <h4 className="font-semibold text-sm">Key Summary</h4>
                     <p className="text-xs text-muted-foreground">{report.summary}</p>
                </div>
                 <div className="space-y-2">
                    <h4 className="font-semibold text-sm flex items-center gap-2"><Bot className="h-4 w-4 text-primary" /> AI Recommendation</h4>
                    <div className={`flex items-center gap-2 p-2 rounded-md ${report.recommendation === 'Good Fit' ? 'bg-green-100' : 'bg-red-100'}`}>
                        {report.recommendation === 'Good Fit' ? 
                            <CheckCircle className="h-5 w-5 text-green-600" /> : 
                            <ThumbsDown className="h-5 w-5 text-red-600" />
                        }
                        <div>
                             <p className={`font-bold text-sm ${report.recommendation === 'Good Fit' ? 'text-green-800' : 'text-red-800'}`}>
                                {report.recommendation}
                            </p>
                            <p className={`text-xs ${report.recommendation === 'Good Fit' ? 'text-green-700' : 'text-red-700'}`}>
                                {report.recommendationReason}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        )}

      </CardContent>
    </Card>
  );
}
