"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const data = [
  { name: "Capital Flow", used: 400000, remaining: 600000 },
  { name: "FinTrust", used: 300000, remaining: 500000 },
  { name: "Supply Co.", used: 900000, remaining: 300000 },
];

export function ProgramPerformanceChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Program-wise Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} stroke="hsl(var(--border))" />
                    <YAxis tickFormatter={(value) => `$${Number(value) / 1000}k`} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} stroke="hsl(var(--border))" />
                    <Tooltip
                        contentStyle={{
                            background: "hsl(var(--background))",
                            borderColor: "hsl(var(--border))",
                            borderRadius: "var(--radius)",
                        }}
                    />
                    <Bar dataKey="used" stackId="a" fill="hsl(var(--primary))" name="Used Limit" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="remaining" stackId="a" fill="hsl(var(--secondary))" name="Available Limit" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
