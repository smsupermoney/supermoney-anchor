
"use client";

import { useState } from "react";
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";
import type { Repayment } from "@/types";
import AddRepaymentDialog from "@/components/add-repayment-dialog";
import CollectionDashboardTable from "./collection-dashboard-table";


export default function CollectionDashboardPage() {
    const [repayments, setRepayments] = useState<Repayment[]>([]);
   
    const handleAddRepayment = (newRepaymentData: Omit<Repayment, 'id' | 'status' | 'link' | 'amountRepaid'>) => {
        const newRepayment: Repayment = {
            id: `REPAY-${Date.now()}`,
            ...newRepaymentData,
            amountRepaid: 0,
            status: 'Link Sent',
            link: `https://repay.supermoney.in/${Date.now()}`
        };
        setRepayments(prev => [...prev, newRepayment]);
    };

    return (
        <>
            <PageHeader title="Collection Dashboard">
                <AddRepaymentDialog onAddRepayment={handleAddRepayment}>
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4"/>
                        Add Repayment
                    </Button>
                </AddRepaymentDialog>
            </PageHeader>
            <Card className="mt-4">
                <CardHeader>
                    <CardTitle>Repayment Tracking</CardTitle>
                    <CardDescription>
                        Track and manage invoice repayments and collections.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                   <CollectionDashboardTable repayments={repayments} />
                </CardContent>
            </Card>
        </>
    );
}
