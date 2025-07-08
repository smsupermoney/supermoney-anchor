
"use client";

import PageHeader from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgramPerformanceChart } from "@/components/charts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, Send, TrendingUp, Library } from "lucide-react";
import { useState, useMemo } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { invoices, lenders } from "@/lib/data";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const initialMessages = [
  { from: "ai", text: "Hello! I'm your financial assistant. How can I help you today? You can ask me things like 'What's our total utilized limit?' or 'Show me the top 5 overdue invoices'." },
];

const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
const formatCompactCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', notation: 'compact', maximumFractionDigits: 1 }).format(amount);

export default function CfoDashboardPage() {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");

  const {
    totalSanctionedLimit,
    totalUtilizedLimit,
    totalAvailableLimit,
    weightedAverageCostOfCapital,
    totalOverdueAmount,
  } = useMemo(() => {
    let totalSanctionedLimit = 0;
    let totalUtilizedLimit = 0;
    let weightedCostSum = 0;
    let totalOverdueAmount = 0;

    lenders.forEach(lender => {
      totalSanctionedLimit += lender.totalLimit;
      
      const programs = invoices.filter(i => {
        const program = lender.programs.find(p => p.id === i.programId);
        return !!program;
      });

      const utilizedForLender = programs.reduce((sum, inv) => sum + inv.amount, 0);
      totalUtilizedLimit += utilizedForLender;

      lender.programs.forEach(p => {
        const programInvoices = invoices.filter(i => i.programId === p.id);
        const utilizedForProgram = programInvoices.reduce((sum, inv) => sum + inv.amount, 0);
        weightedCostSum += utilizedForProgram * p.interestRate;
      });
      
      const overdueInvoices = invoices.filter(i => {
        const program = lender.programs.find(p => p.id === i.programId);
        return !!program && i.status === 'Overdue';
      });
      totalOverdueAmount += overdueInvoices.reduce((sum, inv) => sum + inv.amount, 0);
    });

    const totalAvailableLimit = totalSanctionedLimit - totalUtilizedLimit;
    const weightedAverageCostOfCapital = totalUtilizedLimit > 0 ? weightedCostSum / totalUtilizedLimit : 0;
    
    return {
      totalSanctionedLimit,
      totalUtilizedLimit,
      totalAvailableLimit,
      weightedAverageCostOfCapital,
      totalOverdueAmount,
    };
  }, []);

  const handleSend = () => {
    if (input.trim() === "") return;
    const newMessages = [...messages, { from: "user", text: input }];
    setMessages(newMessages);
    setInput("");

    // Simulate AI response
    setTimeout(() => {
      setMessages(prev => [...prev, { from: "ai", text: `I am processing your query for: "${input}". This feature is currently in development.` }]);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-full gap-4 p-2">
      <PageHeader title="CFO Command Center" />

      {/* KPI Summary Bar */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Sanctioned</CardDescription>
            <CardTitle className="text-2xl">{formatCompactCurrency(totalSanctionedLimit)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Utilized</CardDescription>
            <CardTitle className="text-2xl">{formatCompactCurrency(totalUtilizedLimit)}</CardTitle>
          </CardHeader>
        </Card>
         <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Available</CardDescription>
            <CardTitle className="text-2xl text-primary">{formatCompactCurrency(totalAvailableLimit)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Avg. Cost of Capital</CardDescription>
            <CardTitle className="text-2xl">{weightedAverageCostOfCapital.toFixed(2)}%</CardTitle>
          </CardHeader>
        </Card>
         <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Overdue</CardDescription>
            <CardTitle className="text-2xl text-destructive">{formatCompactCurrency(totalOverdueAmount)}</CardTitle>
          </CardHeader>
        </Card>
         <Card>
          <CardHeader className="pb-2">
            <CardDescription>DPO Trend</CardDescription>
            <CardTitle className="text-2xl flex items-center">45 <TrendingUp className="ml-2 h-5 w-5 text-green-500"/></CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="flex-1 grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
            {/* Lender-wise Limit Management Module */}
            <Card>
                <CardHeader>
                    <CardTitle>Lender-wise Limit Management</CardTitle>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                        {lenders.map(lender => {
                            const lenderUtilized = invoices.filter(i => lender.programs.some(p => p.id === i.programId)).reduce((sum, i) => sum + i.amount, 0);
                            const lenderAvailable = lender.totalLimit - lenderUtilized;
                            const isNearingLimit = (lenderUtilized / lender.totalLimit) * 100 > 80;

                            return (
                                <AccordionItem value={lender.id} key={lender.id}>
                                    <AccordionTrigger className="hover:no-underline">
                                        <div className="w-full grid grid-cols-5 items-center text-sm gap-4">
                                            <div className="font-bold col-span-2 flex items-center gap-2">
                                                <Library className="h-4 w-4 text-muted-foreground" />
                                                {lender.name}
                                                {isNearingLimit && <Badge variant="destructive" className="text-xs">Limit Reached</Badge>}
                                            </div>
                                            <div className="text-right">{formatCurrency(lender.totalLimit)}</div>
                                            <div className="text-right">{formatCurrency(lenderUtilized)}</div>
                                            <div className="text-right">{formatCurrency(lenderAvailable)}</div>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <div className="px-4 py-2 bg-secondary/50 rounded-md">
                                            <div className="grid grid-cols-6 gap-4 font-semibold text-xs text-muted-foreground mb-2">
                                                <div className="col-span-2">Program Name</div>
                                                <div>Limit</div>
                                                <div>Utilized</div>
                                                <div>Available</div>
                                                <div className="text-center">APR%</div>
                                            </div>
                                            {lender.programs.map(program => {
                                                const programInvoices = invoices.filter(i => i.programId === program.id);
                                                const programUtilized = programInvoices.reduce((sum, i) => sum + i.amount, 0);
                                                const programLimit = lender.limitType === 'Fungible' ? lender.totalLimit : program.limit || 0;
                                                const programAvailable = programLimit - programUtilized;

                                                return (
                                                    <div key={program.id} className="grid grid-cols-6 gap-4 items-center text-xs py-1">
                                                        <div className="col-span-2 font-medium">{program.name}</div>
                                                        <div>{lender.limitType === 'Fungible' ? <Badge variant="secondary">Interchangeable</Badge> : formatCurrency(program.limit || 0)}</div>
                                                        <div>{formatCurrency(programUtilized)}</div>
                                                        <div>{formatCurrency(programAvailable)}</div>
                                                        <div className="text-center">{program.interestRate.toFixed(2)}%</div>
                                                        <Button size="sm" variant="ghost" asChild><Link href="/invoices">View Txns</Link></Button>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            )
                        })}
                    </Accordion>
                </CardContent>
            </Card>
            <ProgramPerformanceChart />
        </div>
        <div className="md:col-span-1 flex flex-col">
          <Card className="flex-1 flex flex-col">
            <CardHeader className="flex flex-row items-center gap-2">
              <Bot className="h-6 w-6 text-primary" />
              <div>
                <CardTitle>AI Financial Assistant</CardTitle>
                <CardDescription>Ask me anything about your data.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-2 p-0">
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((msg, index) => (
                    <div key={index} className={`flex items-start gap-3 ${msg.from === 'user' ? 'justify-end' : ''}`}>
                      {msg.from === 'ai' && <Avatar className="w-8 h-8"><AvatarFallback>AI</AvatarFallback></Avatar>}
                      <div className={`rounded-lg px-3 py-2 max-w-xs ${msg.from === 'ai' ? 'bg-secondary' : 'bg-primary text-primary-foreground'}`}>
                        <p className="text-sm">{msg.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="p-4 border-t">
                <div className="relative">
                  <Input 
                    placeholder="Type your query..." 
                    className="pr-12" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  />
                  <Button size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8" onClick={handleSend}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
