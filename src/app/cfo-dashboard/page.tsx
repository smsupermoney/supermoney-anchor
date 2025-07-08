"use client";

import PageHeader from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgramPerformanceChart } from "@/components/charts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, Send } from "lucide-react";
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const initialMessages = [
  { from: "ai", text: "Hello! I'm your financial assistant. How can I help you today? You can ask me things like 'What's our total utilized limit?' or 'Show me the top 5 overdue invoices'." },
];

export default function CfoDashboardPage() {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");

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
    <div className="flex flex-col h-full">
      <PageHeader title="CFO Command Center" />
      <div className="flex-1 grid md:grid-cols-3 gap-6 mt-4">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>SCF Volume Trends</CardTitle>
              <CardDescription>Placeholder for SCF Volume Trends chart.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-60 bg-secondary rounded-md flex items-center justify-center">
                <p className="text-muted-foreground">Chart Placeholder</p>
              </div>
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
