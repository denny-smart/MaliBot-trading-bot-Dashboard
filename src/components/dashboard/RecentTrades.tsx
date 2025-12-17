import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatCurrency, formatTimeAgo } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface Trade {
  id: string;
  time: string;
  direction: 'RISE' | 'FALL';
  entry_price: number;
  exit_price?: number;
  profit?: number;
  status: 'open' | 'closed' | 'win' | 'loss';
}

interface RecentTradesProps {
  trades: Trade[];
}

export function RecentTrades({ trades }: RecentTradesProps) {
  return (
    <div className="stat-card h-[400px]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">Recent Trades</h3>
        <Badge variant="secondary" className="text-xs">
          Live
        </Badge>
      </div>

      <ScrollArea className="h-[320px] pr-4">
        <div className="space-y-3">
          {trades.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No recent trades
            </p>
          ) : (
            trades.map((trade) => (
              <div
                key={trade.id}
                className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'p-2 rounded-lg',
                      trade.direction === 'RISE'
                        ? 'bg-success/20 text-success'
                        : 'bg-destructive/20 text-destructive'
                    )}
                  >
                    {trade.direction === 'RISE' ? (
                      <ArrowUp className="w-4 h-4" />
                    ) : (
                      <ArrowDown className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge
                        className={cn(
                          'text-xs',
                          trade.direction === 'RISE' ? 'badge-rise' : 'badge-fall'
                        )}
                      >
                        {trade.direction}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatTimeAgo(trade.time)}
                      </span>
                    </div>
                    <p className="text-sm font-mono text-muted-foreground mt-1">
                      Entry: {formatCurrency(trade.entry_price)}
                      {trade.exit_price && ` → ${formatCurrency(trade.exit_price)}`}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  {trade.profit !== undefined && (
                    <p
                      className={cn(
                        'font-semibold font-mono',
                        trade.profit >= 0 ? 'profit-positive' : 'profit-negative'
                      )}
                    >
                      {trade.profit >= 0 ? '+' : ''}
                      {formatCurrency(trade.profit)}
                    </p>
                  )}
                  <Badge
                    variant="outline"
                    className={cn(
                      'text-xs mt-1',
                      trade.status === 'win' && 'border-success text-success',
                      trade.status === 'loss' && 'border-destructive text-destructive',
                      trade.status === 'open' && 'border-primary text-primary'
                    )}
                  >
                    {trade.status.charAt(0).toUpperCase() + trade.status.slice(1)}
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
