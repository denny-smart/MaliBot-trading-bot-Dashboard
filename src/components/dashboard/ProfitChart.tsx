import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatCurrency } from '@/lib/formatters';

interface ProfitData {
  time: string;
  profit: number;
}

interface ProfitChartProps {
  data: ProfitData[];
}

export function ProfitChart({ data }: ProfitChartProps) {
  const isProfit = data.length > 0 && data[data.length - 1].profit >= 0;

  return (
    <div className="stat-card h-[400px]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">Profit Over Time</h3>
        <span className="text-xs text-muted-foreground">Last 24 hours</span>
      </div>

      <div className="h-[320px]">
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            No data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={isProfit ? 'hsl(160, 84%, 39%)' : 'hsl(0, 84%, 60%)'}
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor={isProfit ? 'hsl(160, 84%, 39%)' : 'hsl(0, 84%, 60%)'}
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="time"
                stroke="hsl(215, 20%, 55%)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="hsl(215, 20%, 55%)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
                        <p className="text-xs text-muted-foreground">
                          {payload[0].payload.time}
                        </p>
                        <p
                          className={`font-semibold font-mono ${
                            payload[0].value && Number(payload[0].value) >= 0
                              ? 'text-success'
                              : 'text-destructive'
                          }`}
                        >
                          {formatCurrency(Number(payload[0].value) || 0)}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="profit"
                stroke={isProfit ? 'hsl(160, 84%, 39%)' : 'hsl(0, 84%, 60%)'}
                strokeWidth={2}
                fill="url(#profitGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
