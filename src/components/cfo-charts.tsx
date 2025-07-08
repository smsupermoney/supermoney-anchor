
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const costOfCapitalData = [
  { month: "Jan", cost: 12.5 },
  { month: "Feb", cost: 12.3 },
  { month: "Mar", cost: 12.6 },
  { month: "Apr", cost: 12.4 },
  { month: "May", cost: 12.2 },
  { month: "Jun", cost: 12.1 },
];

export function CostOfCapitalChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Cost of Capital Trend</CardTitle>
        <CardDescription>Weighted average cost of capital over the last 6 months.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={costOfCapitalData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <defs>
                        <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} stroke="hsl(var(--border))" />
                    <YAxis tickFormatter={(value) => `${value}%`} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} stroke="hsl(var(--border))" domain={['dataMin - 0.5', 'dataMax + 0.5']} />
                    <Tooltip
                        contentStyle={{
                            background: "hsl(var(--background))",
                            borderColor: "hsl(var(--border))",
                            borderRadius: "var(--radius)",
                            fontSize: "12px",
                        }}
                        formatter={(value) => [`${value?.toString()}%`, 'Avg. Cost']}
                    />
                    <Area type="monotone" dataKey="cost" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorCost)" />
                </AreaChart>
            </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
