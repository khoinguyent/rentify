'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface SpendingTrendChartProps {
  data: Array<{ month: string; total: number }>;
}

export function SpendingTrendChart({ data }: SpendingTrendChartProps) {
  return (
    <Card className="rounded-2xl shadow-sm bg-white mb-10">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">
          Spending Trend
        </CardTitle>
        <p className="text-sm text-gray-500 mt-1">Monthly spending overview</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="month"
              stroke="#6b7280"
              tick={{ fontSize: 12 }}
            />
            <YAxis
              stroke="#6b7280"
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
              formatter={(value: number) => `$${value.toLocaleString()}`}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="total"
              stroke="#5BA0A4"
              strokeWidth={2}
              name="Total Spending"
              dot={{ fill: '#5BA0A4', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

