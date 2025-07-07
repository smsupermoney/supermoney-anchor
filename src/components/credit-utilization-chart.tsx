"use client";

import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts';

type CreditUtilizationChartProps = {
  utilizedCredit: number;
  totalCreditLimit: number;
};

// Use a compact notation and remove .0 from whole numbers
const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', notation: 'compact', maximumFractionDigits: 1 }).format(amount).replace(/\.0(?=\D)/, '');

export default function CreditUtilizationChart({ utilizedCredit, totalCreditLimit }: CreditUtilizationChartProps) {
  const availableLimit = totalCreditLimit - utilizedCredit;

  const data = [
    {
      name: 'Utilization',
      value: utilizedCredit,
      fill: 'hsl(var(--primary))',
    },
  ];

  return (
    <div className="relative w-full h-28">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          innerRadius="70%"
          outerRadius="90%"
          data={data}
          startAngle={180}
          endAngle={0}
          barSize={12}
          cy="100%"
        >
          <PolarAngleAxis
            type="number"
            domain={[0, totalCreditLimit]}
            angleAxisId={0}
            tick={false}
          />
          <RadialBar
            background={{ fill: 'hsl(var(--secondary))' }}
            dataKey="value"
            cornerRadius={6}
          />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute inset-x-0 bottom-6 flex flex-col items-center justify-end text-center">
        <p className="text-2xl font-bold text-primary">{formatCurrency(availableLimit)}</p>
        <p className="text-xs text-muted-foreground">Available Limit</p>
      </div>
      <div className="absolute -bottom-1 left-1 right-1 flex justify-between">
        <p className="text-xs font-medium text-muted-foreground">₹0</p>
        <p className="text-xs font-medium text-muted-foreground">{formatCurrency(totalCreditLimit)}</p>
      </div>
    </div>
  );
}
