import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EmptyState } from '@/components/ui/EmptyState';
import { ClipboardList, History, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/services/api';
import { formatCurrency, formatDate, formatDuration } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { Download, Search, Filter, ArrowUp, ArrowDown } from 'lucide-react';
import { transformTrades, calculateTradeStats, type FrontendTrade, type FrontendTradeStats } from '@/lib/tradeTransformers';


interface TradeStats {
  total_trades: number;
  win_rate: number;
  total_profit: number;
  avg_win: number;
  avg_loss: number;
  largest_win: number;
  largest_loss: number;
  avg_duration: number;
  profit_factor: number;
}

export default function Trades() {
  const [activeTrades, setActiveTrades] = useState<FrontendTrade[]>([]);
  const [historyTrades, setHistoryTrades] = useState<FrontendTrade[]>([]);
  const [stats, setStats] = useState<FrontendTradeStats | null>(null);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [directionFilter, setDirectionFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [activeRes, historyRes, configRes] = await Promise.all([
        api.trades.active(),
        api.trades.history(),
        api.config.current(),
      ]);

      setHasApiKey(!!configRes.data?.deriv_api_key && configRes.data.deriv_api_key !== '');

      // Transform backend data to frontend format
      const activeTrades = transformTrades(activeRes.data || []);
      const historyTrades = transformTrades(historyRes.data || []);
      const stats = calculateTradeStats(historyTrades);

      setActiveTrades(activeTrades);
      setHistoryTrades(historyTrades);
      setStats(stats);
    } catch (error) {
      console.error('Failed to fetch trades:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredHistory = historyTrades.filter((trade) => {
    const matchesSearch = trade.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDirection = directionFilter === 'all' || trade.direction === directionFilter;
    const matchesStatus = statusFilter === 'all' || trade.status === statusFilter;
    return matchesSearch && matchesDirection && matchesStatus;
  });

  const exportToCSV = () => {
    const headers = ['Trade ID', 'Date/Time', 'Direction', 'Entry Price', 'Exit Price', 'Stake', 'Profit/Loss', 'Duration (s)', 'Status'];
    const rows = filteredHistory.map((trade) => [
      trade.id,
      trade.time,
      trade.direction,
      trade.entry_price,
      trade.exit_price ?? '',
      trade.stake,
      trade.profit ?? '',
      trade.duration ?? '',
      trade.status,
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `trade_history_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const TradeRow = ({ trade }: { trade: FrontendTrade }) => (
    <tr className="hover:bg-secondary/50 transition-colors">
      <td className="py-3 px-4 font-mono text-sm">{trade.id}</td>
      <td className="py-3 px-4 text-muted-foreground text-sm">{formatDate(trade.time)}</td>
      <td className="py-3 px-4">
        <Badge className={cn('text-xs', trade.direction === 'UP' ? 'badge-rise' : 'badge-fall')}>
          {trade.direction === 'UP' ? (
            <ArrowUp className="w-3 h-3 mr-1" />
          ) : (
            <ArrowDown className="w-3 h-3 mr-1" />
          )}
          {trade.direction}
        </Badge>
      </td>
      <td className="py-3 px-4 font-mono text-sm">{formatCurrency(trade.entry_price)}</td>
      <td className="py-3 px-4 font-mono text-sm">
        {trade.exit_price ? formatCurrency(trade.exit_price) : '-'}
      </td>
      <td className="py-3 px-4 font-mono text-sm">{formatCurrency(trade.stake)}</td>
      <td className="py-3 px-4">
        {trade.profit !== undefined ? (
          <span className={cn('font-mono font-medium', trade.profit >= 0 ? 'profit-positive' : 'profit-negative')}>
            {trade.profit >= 0 ? '+' : ''}{formatCurrency(trade.profit)}
          </span>
        ) : (
          '-'
        )}
      </td>
      <td className="py-3 px-4 text-sm text-muted-foreground">
        {trade.duration ? formatDuration(trade.duration) : '-'}
      </td>
      <td className="py-3 px-4">
        <Badge
          variant="outline"
          className={cn(
            'text-xs',
            trade.status === 'win' && 'border-success text-success',
            trade.status === 'loss' && 'border-destructive text-destructive',
            trade.status === 'open' && 'border-primary text-primary'
          )}
        >
          {trade.status.charAt(0).toUpperCase() + trade.status.slice(1)}
        </Badge>
      </td>
    </tr>
  );

  if (isLoading) {
    return (
      <DashboardLayout title="Trades">
        <div className="space-y-6">
          <Skeleton className="h-12 w-96" />
          <Skeleton className="h-[600px]" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Trades">
      <Tabs defaultValue="active" className="space-y-6">
        <TabsList className="glass-panel p-1">
          <TabsTrigger value="active">Active Trades</TabsTrigger>
          <TabsTrigger value="history">Trade History</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <div className="glass-card overflow-hidden p-6">
            <h3 className="font-semibold text-foreground mb-4">Open Positions</h3>
            <ScrollArea className="h-[500px]">
              {activeTrades.length === 0 ? (
                <EmptyState
                  icon={ClipboardList}
                  title="No Active Trades"
                  description="The bot is currently waiting for market opportunities."
                  className="border-none bg-transparent"
                />
              ) : (
                <>
                  <div className="hidden md:block">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Trade ID</th>
                          <th>Time Opened</th>
                          <th>Direction</th>
                          <th>Entry Price</th>
                          <th>Current Price</th>
                          <th>Stake</th>
                          <th>Unrealized P/L</th>
                          <th>Duration</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activeTrades.map((trade) => <TradeRow key={trade.id} trade={trade} />)}
                      </tbody>
                    </table>
                  </div>
                  <div className="md:hidden space-y-4">
                    {activeTrades.map((trade) => (
                      <Card key={trade.id} className="p-4 bg-card border-border">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <span className="font-mono text-xs text-muted-foreground">#{trade.id}</span>
                            <div className="text-sm font-medium mt-1">{formatDate(trade.time)}</div>
                          </div>
                          <Badge className={cn('text-xs', trade.direction === 'UP' ? 'badge-rise' : 'badge-fall')}>
                            {trade.direction === 'UP' ? <ArrowUp className="w-3 h-3 mr-1" /> : <ArrowDown className="w-3 h-3 mr-1" />}
                            {trade.direction}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                          <div>
                            <div className="text-muted-foreground text-xs">Entry</div>
                            <div className="font-mono">{formatCurrency(trade.entry_price)}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-muted-foreground text-xs">Stake</div>
                            <div className="font-mono">{formatCurrency(trade.stake)}</div>
                          </div>
                        </div>
                        <div className="pt-3 border-t border-border flex justify-between items-center">
                          <span className="text-xs text-muted-foreground">Unrealized P/L</span>
                          {trade.profit !== undefined ? (
                            <span className={cn('font-mono font-bold', trade.profit >= 0 ? 'profit-positive' : 'profit-negative')}>
                              {trade.profit >= 0 ? '+' : ''}{formatCurrency(trade.profit)}
                            </span>
                          ) : '-'}
                        </div>
                      </Card>
                    ))}
                  </div>
                </>
              )}
            </ScrollArea>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by Trade ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={directionFilter} onValueChange={setDirectionFilter}>
              <SelectTrigger className="w-[140px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Direction" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Directions</SelectItem>
                <SelectItem value="UP">Rise (Up)</SelectItem>
                <SelectItem value="DOWN">Fall (Down)</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="win">Win</SelectItem>
                <SelectItem value="loss">Loss</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="gap-2" onClick={exportToCSV} disabled={filteredHistory.length === 0}>
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
          </div>

          <div className="glass-card overflow-hidden p-6">
            <ScrollArea className="h-[500px]">
              {filteredHistory.length === 0 ? (
                <EmptyState
                  icon={History}
                  title="No Trade History"
                  description={hasApiKey
                    ? "Trade history will be available once trades are executed and closed."
                    : "Configure the bot to start trading and generate history."
                  }
                  className="border-none bg-transparent"
                />
              ) : (
                <>
                  <div className="hidden md:block">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Trade ID</th>
                          <th>Date/Time</th>
                          <th>Direction</th>
                          <th>Entry Price</th>
                          <th>Exit Price</th>
                          <th>Stake</th>
                          <th>Profit/Loss</th>
                          <th>Duration</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredHistory.map((trade) => <TradeRow key={trade.id} trade={trade} />)}
                      </tbody>
                    </table>
                  </div>
                  <div className="md:hidden space-y-4">
                    {filteredHistory.map((trade) => (
                      <Card key={trade.id} className="p-4 bg-card border-border">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <span className="font-mono text-xs text-muted-foreground">#{trade.id}</span>
                            <div className="text-sm font-medium mt-1">{formatDate(trade.time)}</div>
                          </div>
                          <Badge
                            variant="outline"
                            className={cn(
                              'text-xs',
                              trade.status === 'win' && 'border-success text-success',
                              trade.status === 'loss' && 'border-destructive text-destructive',
                              trade.status === 'open' && 'border-primary text-primary'
                            )}
                          >
                            {trade.status.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                          <div className="flex items-center gap-1 col-span-2 mb-1">
                            <Badge className={cn('text-[10px] h-5 px-1.5', trade.direction === 'UP' ? 'badge-rise' : 'badge-fall')}>
                              {trade.direction === 'UP' ? <ArrowUp className="w-3 h-3 mr-1" /> : <ArrowDown className="w-3 h-3 mr-1" />}
                              {trade.direction}
                            </Badge>
                          </div>
                          <div>
                            <div className="text-muted-foreground text-xs">Entry</div>
                            <div className="font-mono">{formatCurrency(trade.entry_price)}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-muted-foreground text-xs">Exit</div>
                            <div className="font-mono">{trade.exit_price ? formatCurrency(trade.exit_price) : '-'}</div>
                          </div>
                        </div>
                        <div className="pt-3 border-t border-border flex justify-between items-center">
                          <div className="text-xs text-muted-foreground">
                            Stake: {formatCurrency(trade.stake)}
                          </div>
                          {trade.profit !== undefined ? (
                            <span className={cn('font-mono font-bold text-base', trade.profit >= 0 ? 'profit-positive' : 'profit-negative')}>
                              {trade.profit >= 0 ? '+' : ''}{formatCurrency(trade.profit)}
                            </span>
                          ) : '-'}
                        </div>
                      </Card>
                    ))}
                  </div>
                </>
              )}
            </ScrollArea>
          </div>
        </TabsContent>

        <TabsContent value="stats" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="stat-card text-center">
              <p className="text-sm text-muted-foreground">Total Trades</p>
              <p className="text-3xl font-bold text-foreground mt-2">{stats?.total_trades || 0}</p>
            </div>
            <div className="stat-card text-center">
              <p className="text-sm text-muted-foreground">Win Rate</p>
              <p className="text-3xl font-bold text-success mt-2">{(stats?.win_rate || 0).toFixed(1)}%</p>
            </div>
            <div className="stat-card text-center">
              <p className="text-sm text-muted-foreground">Total Profit</p>
              <p className={cn('text-3xl font-bold mt-2', (stats?.total_profit || 0) >= 0 ? 'text-success' : 'text-destructive')}>
                {formatCurrency(stats?.total_profit || 0)}
              </p>
            </div>
            <div className="stat-card text-center">
              <p className="text-sm text-muted-foreground">Profit Factor</p>
              <p className="text-3xl font-bold text-foreground mt-2">{(stats?.profit_factor || 0).toFixed(2)}</p>
            </div>
            <div className="stat-card text-center">
              <p className="text-sm text-muted-foreground">Average Win</p>
              <p className="text-3xl font-bold text-success mt-2">{formatCurrency(stats?.avg_win || 0)}</p>
            </div>
            <div className="stat-card text-center">
              <p className="text-sm text-muted-foreground">Average Loss</p>
              <p className="text-3xl font-bold text-destructive mt-2">{formatCurrency(stats?.avg_loss || 0)}</p>
            </div>
            <div className="stat-card text-center">
              <p className="text-sm text-muted-foreground">Largest Win</p>
              <p className="text-3xl font-bold text-success mt-2">{formatCurrency(stats?.largest_win || 0)}</p>
            </div>
            <div className="stat-card text-center">
              <p className="text-sm text-muted-foreground">Largest Loss</p>
              <p className="text-3xl font-bold text-destructive mt-2">{formatCurrency(stats?.largest_loss || 0)}</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
