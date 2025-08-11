
"use client";

import { useMemo, useState } from 'react';
import * as xlsx from 'xlsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { ResponsiveContainer, BarChart, XAxis, YAxis, Tooltip, Legend, Bar, PieChart, Pie, Cell, TooltipProps } from 'recharts';
import type { Invoice, Dealer, Program, User } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import StatusBadge from '@/components/status-badge';
import { NameValue } from 'recharts/types/component/DefaultTooltipContent';

const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#ff4d4d'];

type ReportsClientPageProps = {
    initialInvoices: Invoice[];
    initialDealers: Dealer[];
    initialPrograms: Program[];
    users: User[];
    isAdmin: boolean;
};

export default function ReportsClientPage({ initialInvoices, initialDealers, initialPrograms, users, isAdmin }: ReportsClientPageProps) {
    
    const summaryStats = useMemo(() => {
        const totalInvoiceValue = initialInvoices.reduce((sum, inv) => sum + inv.amount, 0);
        const totalOverdueAmount = initialInvoices.reduce((sum, inv) => sum + (inv.overdueAmount || 0), 0);
        const activeDealers = initialDealers.filter(d => d.status === 'Active').length;
        const activePrograms = initialPrograms.length;
        
        return { totalInvoiceValue, totalOverdueAmount, activeDealers, activePrograms };
    }, [initialInvoices, initialDealers, initialPrograms]);
    
    const invoiceStatusData = useMemo(() => {
        const statusCounts = initialInvoices.reduce((acc, inv) => {
            acc[inv.status] = (acc[inv.status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        
        return Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
    }, [initialInvoices]);

    const programInvoiceData = useMemo(() => {
        const programAmounts = initialInvoices.reduce((acc, inv) => {
            const programName = initialPrograms.find(p => p.id === inv.programId)?.lenderName || 'Unknown';
            acc[programName] = (acc[programName] || 0) + inv.amount;
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(programAmounts).map(([name, value]) => ({ name, value }));
    }, [initialInvoices, initialPrograms]);
    
     const programLimitData = useMemo(() => {
        return initialPrograms.map(p => ({
            name: p.lenderName,
            Utilized: p.usedLimit || 0,
            Available: (p.totalLimit || 0) - (p.usedLimit || 0),
        }));
    }, [initialPrograms]);

    const topOverdueDealers = useMemo(() => {
        return initialDealers
            .filter(d => d.overdueAmount > 0)
            .sort((a, b) => b.overdueAmount - a.overdueAmount)
            .slice(0, 5)
            .map(d => ({ name: d.name, Overdue: d.overdueAmount }));
    }, [initialDealers]);
    
    const downloadExcel = (data: any[], sheetName: string, fileName: string) => {
        const worksheet = xlsx.utils.json_to_sheet(data);
        const workbook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(workbook, worksheet, sheetName);
        xlsx.writeFile(workbook, fileName);
    };

    const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
        if (active && payload && payload.length) {
            return (
            <div className="p-2 text-xs bg-background/80 backdrop-blur-sm border rounded-md shadow-lg">
                <p className="font-bold">{label}</p>
                {payload.map((entry: any) => (
                    <p key={entry.name} style={{ color: entry.color }}>
                        {`${entry.name}: ${entry.dataKey === 'value' ? entry.value : formatCurrency(entry.value)}`}
                    </p>
                ))}
            </div>
            );
        }
        return null;
    };
    
    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader><CardTitle className='text-sm font-medium'>Total Invoice Value</CardTitle></CardHeader>
                    <CardContent><p className='text-2xl font-bold'>{formatCurrency(summaryStats.totalInvoiceValue)}</p></CardContent>
                </Card>
                 <Card>
                    <CardHeader><CardTitle className='text-sm font-medium'>Total Overdue</CardTitle></CardHeader>
                    <CardContent><p className='text-2xl font-bold text-destructive'>{formatCurrency(summaryStats.totalOverdueAmount)}</p></CardContent>
                </Card>
                 <Card>
                    <CardHeader><CardTitle className='text-sm font-medium'>Active Dealers</CardTitle></CardHeader>
                    <CardContent><p className='text-2xl font-bold'>{summaryStats.activeDealers}</p></CardContent>
                </Card>
                 <Card>
                    <CardHeader><CardTitle className='text-sm font-medium'>Active Programs</CardTitle></CardHeader>
                    <CardContent><p className='text-2xl font-bold'>{summaryStats.activePrograms}</p></CardContent>
                </Card>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Invoice Status Distribution</CardTitle>
                        <CardDescription>A breakdown of all invoices by their current status.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-72">
                         <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={invoiceStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                    {invoiceStatusData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Top 5 Overdue Dealers</CardTitle>
                         <CardDescription>Dealers with the highest outstanding overdue amounts.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                             <BarChart data={topOverdueDealers} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <XAxis type="number" tickFormatter={(val) => formatCurrency(val as number)} />
                                <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 10 }}/>
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                <Bar dataKey="Overdue" fill="#FF8042" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
             <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Invoice Value by Program</CardTitle>
                        <CardDescription>Total value of invoices processed under each program.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={programInvoiceData}>
                                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                                <YAxis tickFormatter={(val) => formatCurrency(val as number)} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                <Bar dataKey="value" name="Invoice Value" fill="#8884d8" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Limit Utilization by Program</CardTitle>
                        <CardDescription>Comparison of utilized vs. available credit limits.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={programLimitData}>
                                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                                <YAxis tickFormatter={(val) => formatCurrency(val as number)}/>
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                <Bar dataKey="Utilized" stackId="a" fill="#00C49F" />
                                <Bar dataKey="Available" stackId="a" fill="#FFBB28" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
            
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Data Export</CardTitle>
                            <CardDescription>Download raw data for further analysis.</CardDescription>
                        </div>
                        <Button variant="outline" onClick={() => downloadExcel(initialInvoices, 'Invoices', 'invoice_report.xlsx')}>
                            <Download className="mr-2 h-4 w-4" /> Download Invoices
                        </Button>
                         <Button variant="outline" onClick={() => downloadExcel(initialDealers, 'Dealers', 'dealer_report.xlsx')}>
                            <Download className="mr-2 h-4 w-4" /> Download Dealers
                        </Button>
                         <Button variant="outline" onClick={() => downloadExcel(initialPrograms, 'Programs', 'program_report.xlsx')}>
                            <Download className="mr-2 h-4 w-4" /> Download Programs
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="relative w-full overflow-auto border rounded-md max-h-96">
                        <Table>
                            <TableHeader className="sticky top-0 bg-background">
                                <TableRow>
                                    <TableHead>Invoice #</TableHead>
                                    <TableHead>Dealer</TableHead>
                                    <TableHead>Program</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Due Date</TableHead>
                                </TableRow>
                            </TableHeader>
                             <TableBody>
                                {initialInvoices.slice(0, 10).map(invoice => (
                                    <TableRow key={invoice.id}>
                                        <TableCell>{invoice.invoiceNumber}</TableCell>
                                        <TableCell>{invoice.dealerName}</TableCell>
                                        <TableCell>{initialPrograms.find(p => p.id === invoice.programId)?.lenderName || 'Unknown'}</TableCell>
                                        <TableCell>{formatCurrency(invoice.amount)}</TableCell>
                                        <TableCell><StatusBadge status={invoice.status}/></TableCell>
                                        <TableCell>{invoice.dueDate}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                     <p className="text-xs text-muted-foreground text-center mt-2">Showing first 10 invoices. Use the download button for the full report.</p>
                </CardContent>
            </Card>

        </div>
    );
}

