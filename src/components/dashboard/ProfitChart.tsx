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
  const positiveColor = 'hsl(var(--success))';
  const negativeColor = 'hsl(var(--destructive))';

  return (
    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl h-[400px] flex flex-col">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <h3 className="font-semibold text-white">Profit Over Time</h3>
        <span className="text-xs text-zinc-400 bg-zinc-800 px-2.5 py-1 rounded-md">Last 24 hours</span>
      </div>

      <div className="flex-1 min-h-0">
        {data.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-zinc-500 border-2 border-dashed border-zinc-800 rounded-xl bg-zinc-800/20">
            <span className="opacity-50">No data available</span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={isProfit ? positiveColor : negativeColor}
                    stopOpacity={0.2}
                  />
                  <stop
                    offset="95%"
                    stopColor={isProfit ? positiveColor : negativeColor}
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="time"
                stroke="#52525b"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              <YAxis
                stroke="#52525b"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${value}`}
                dx={-10}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 shadow-2xl min-w-[150px]">
                        <p className="text-xs text-zinc-400 mb-2 pb-2 border-b border-zinc-800">
                          {payload[0].payload.time}
                        </p>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-xs font-medium text-white">Profit:</span>
                          <span
                            className={`font-mono font-bold text-sm tracking-tight ${payload[0].value && Number(payload[0].value) >= 0
                              ? 'text-success'
                              : 'text-rose-500'
                              }`}
                          >
                            {formatCurrency(Number(payload[0].value) || 0)}
                          </span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="profit"
                stroke={isProfit ? positiveColor : negativeColor}
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
