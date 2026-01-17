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
  return (
    <div className="glass-card p-6 rounded-xl border border-white/10 h-[400px] flex flex-col">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <h3 className="font-semibold text-foreground">Recent Trades</h3>
        <Badge variant="secondary" className="text-xs bg-white/5 hover:bg-white/10 text-muted-foreground border-white/5">
          Live
        </Badge>
      </div>

      <ScrollArea className="flex-1 -mr-4 pr-4">
        <div className="space-y-3 pb-2">
          {trades.length === 0 ? (
            <div className="h-[250px] w-full border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center text-muted-foreground bg-white/5/50 gap-2">
              <div className="p-3 bg-white/5 rounded-full">
                <ArrowUp className="w-5 h-5 opacity-50" />
              </div>
              <p className="text-sm font-medium">No recent trades</p>
              <p className="text-xs opacity-50">Waiting for market activity...</p>
            </div>
          ) : (
            trades.map((trade) => (
              <div
                key={trade.id}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-white/5 group"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'p-2 rounded-lg transition-colors',
                      trade.direction === 'UP'
                        ? 'bg-success/10 text-success group-hover:bg-success/20'
                        : 'bg-destructive/10 text-destructive group-hover:bg-destructive/20'
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
                          'text-[10px] px-1.5 py-0 h-5',
                          trade.direction === 'UP' ? 'bg-success/20 text-success hover:bg-success/30 border-success/20' : 'bg-destructive/20 text-destructive hover:bg-destructive/30 border-destructive/20'
                        )}
                        variant="outline"
                      >
                        {trade.direction}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatTimeAgo(trade.time)}
                      </span>
                    </div>
                    <p className="text-xs font-mono text-muted-foreground mt-1">
                      <span className="opacity-70">Entry:</span> {formatCurrency(trade.entry_price)}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  {trade.profit !== undefined && (
                    <p
                      className={cn(
                        'font-bold font-mono text-sm',
                        trade.profit >= 0 ? 'text-success' : 'text-destructive'
                      )}
                    >
                      {trade.profit >= 0 ? '+' : ''}
                      {formatCurrency(trade.profit)}
                    </p>
                  )}
                  <Badge
                    variant="outline"
                    className={cn(
                      'text-[10px] px-1.5 py-0 h-5 mt-1 border-0',
                      trade.status === 'win' && 'bg-success/10 text-success',
                      trade.status === 'loss' && 'bg-destructive/10 text-destructive',
                      trade.status === 'open' && 'bg-primary/10 text-primary animate-pulse'
                    )}
                  >
                    {trade.status.toUpperCase()}
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
