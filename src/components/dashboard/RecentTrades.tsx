import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatCurrency, formatTimeAgo, formatTime } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { type FrontendTrade } from '@/lib/tradeTransformers';

interface RecentTradesProps {
  trades: FrontendTrade[];
}

export function RecentTrades({ trades }: RecentTradesProps) {
  const renderTradeTime = (time: string): string => {
    const exact = formatTime(time);
    const relative = formatTimeAgo(time);

    if (exact === 'Invalid Time') {
      return 'Unknown time';
    }
    if (relative === 'Invalid Date') {
      return exact;
    }
    return `${exact} (${relative})`;
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl h-[400px] flex flex-col">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <h3 className="font-semibold text-white">Recent Trades</h3>
        <Badge className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-400 border-none">
          Live
        </Badge>
      </div>

      <ScrollArea className="flex-1 -mr-4 pr-4">
        <div className="space-y-3 pb-2">
          {trades.length === 0 ? (
            <div className="h-[250px] w-full border-2 border-dashed border-zinc-800 rounded-xl flex flex-col items-center justify-center text-zinc-500 bg-zinc-800/20 gap-2">
              <div className="p-3 bg-zinc-800/50 rounded-full">
                <ArrowUp className="w-5 h-5 opacity-50" />
              </div>
              <p className="text-sm font-medium text-zinc-400">No recent trades</p>
              <p className="text-xs opacity-50">Waiting for market activity...</p>
            </div>
          ) : (
            trades.map((trade) => (
              <div
                key={trade.id}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-zinc-800/50 transition-colors border border-transparent hover:border-zinc-700/50 group"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'p-2 rounded-xl transition-colors',
                      trade.direction === 'UP'
                        ? 'bg-cyan-500/10 text-cyan-500 group-hover:bg-cyan-500/20'
                        : 'bg-rose-500/10 text-rose-500 group-hover:bg-rose-500/20'
                    )}
                  >
                    {trade.direction === 'UP' ? (
                      <ArrowUp className="w-4 h-4" />
                    ) : (
                      <ArrowDown className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge
                        className={cn(
                          'text-[9px] px-1.5 py-0.5 h-4 border-none font-bold tracking-wider',
                          trade.direction === 'UP' ? 'bg-cyan-500/20 text-cyan-500 hover:bg-cyan-500/30' : 'bg-rose-500/20 text-rose-500 hover:bg-rose-500/30'
                        )}
                      >
                        {trade.direction}
                      </Badge>
                      {trade.strategy_type && (
                        <Badge className="text-[9px] px-1.5 py-0.5 h-4 bg-zinc-800 text-zinc-400 border-none font-medium hover:bg-zinc-700">
                          {trade.strategy_type}
                        </Badge>
                      )}
                      <span className="text-xs text-zinc-500 font-mono">
                        {renderTradeTime(trade.time)}
                      </span>
                    </div>
                    <p className="text-xs font-mono text-zinc-500 mt-1">
                      <span className="text-zinc-600">Entry:</span> {formatCurrency(trade.entry_price)}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  {trade.profit !== undefined && (
                    <p
                      className={cn(
                        'font-bold font-mono text-sm tracking-tight',
                        trade.profit >= 0 ? 'text-cyan-400' : 'text-rose-500'
                      )}
                    >
                      {trade.profit >= 0 ? '+' : ''}
                      {formatCurrency(trade.profit)}
                    </p>
                  )}
                  <Badge
                    className={cn(
                      'text-[9px] px-1.5 py-0.5 h-4 mt-1 border-none font-bold uppercase tracking-wider',
                      trade.status === 'win' && 'bg-cyan-500/10 text-cyan-500',
                      trade.status === 'loss' && 'bg-rose-500/10 text-rose-500',
                      trade.status === 'open' && 'bg-zinc-500/10 text-zinc-400 animate-pulse'
                    )}
                  >
                    {trade.status}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
