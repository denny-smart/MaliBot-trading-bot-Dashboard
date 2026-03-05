import { useEffect, useState } from 'react';
import { EmptyState } from '@/components/ui/EmptyState';
import { ClipboardList, History } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
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
import { wsService } from '@/services/websocket';
import { toast } from '@/hooks/use-toast';
import { formatCurrency, formatDate, formatDuration } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { Download, Search, Filter, ArrowUp, ArrowDown } from 'lucide-react';
import { transformTrades, transformTradeStats, type FrontendTrade, type FrontendTradeStats } from '@/lib/tradeTransformers';

export const getDisplayStatus = (trade: FrontendTrade): FrontendTrade['status'] => {
  if (trade.status === 'open' && typeof trade.profit === 'number' && trade.profit !== 0) {
    return trade.profit > 0 ? 'win' : 'loss';
  }
  return trade.status;
};

export const normalizeTradeStatus = (trade: FrontendTrade): FrontendTrade => {
  const derivedStatus = getDisplayStatus(trade);
  if (derivedStatus === trade.status) {
    return trade;
  }
  return { ...trade, status: derivedStatus };
};

export const isClosedTrade = (trade: FrontendTrade): boolean => {
  const status = getDisplayStatus(trade);
  return status === 'win' || status === 'loss' || status === 'closed';
};

export const mergeHistoryTrades = (
  existingHistory: FrontendTrade[],
  incomingTrades: FrontendTrade[]
): FrontendTrade[] => {
  const tradeMap = new Map<string, FrontendTrade>();

  existingHistory.forEach((trade) => {
    tradeMap.set(trade.id, normalizeTradeStatus(trade));
  });

  incomingTrades.forEach((trade) => {
    tradeMap.set(trade.id, normalizeTradeStatus(trade));
  });

  return Array.from(tradeMap.values()).sort(
    (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
  );
};

export const reconcileActiveTradesWithHistory = (
  activeTrades: FrontendTrade[],
  historyTrades: FrontendTrade[]
): FrontendTrade[] => {
  const closedHistoryIds = new Set(
    historyTrades
      .filter((trade) => isClosedTrade(trade))
      .map((trade) => trade.id)
  );
  if (closedHistoryIds.size === 0) {
    return activeTrades;
  }
  return activeTrades.filter((trade) => !closedHistoryIds.has(trade.id));
};

export default function Trades() {
  const [activeTrades, setActiveTrades] = useState<FrontendTrade[]>([]);
  const [historyTrades, setHistoryTrades] = useState<FrontendTrade[]>([]);
  const [stats, setStats] = useState<FrontendTradeStats | null>(null);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [directionFilter, setDirectionFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [strategyFilter, setStrategyFilter] = useState<string>('all');
  const [exitToggleLoading, setExitToggleLoading] = useState<Record<string, boolean>>({});
  const [syncSubmitting, setSyncSubmitting] = useState(false);
  const [accountStrategy, setAccountStrategy] = useState('Conservative');

  type ExitControlField = 'trailing_enabled' | 'stagnation_enabled';
  type PersistedExitControls = Record<string, Pick<FrontendTrade, 'trailing_enabled' | 'stagnation_enabled'>>;
  const EXIT_CONTROLS_STORAGE_KEY = 'trades_exit_controls_v1';

  const parseBooleanFlag = (value: unknown): boolean | undefined => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') {
      if (value === 1) return true;
      if (value === 0) return false;
      return undefined;
    }
    if (typeof value === 'string') {
      const normalized = value.trim().toLowerCase();
      if (normalized === 'true' || normalized === '1' || normalized === 'yes' || normalized === 'on') return true;
      if (normalized === 'false' || normalized === '0' || normalized === 'no' || normalized === 'off') return false;
    }
    return undefined;
  };

  const readPersistedExitControls = (): PersistedExitControls => {
    if (typeof window === 'undefined') return {};
    try {
      const raw = window.localStorage.getItem(EXIT_CONTROLS_STORAGE_KEY);
      if (!raw) return {};
      const parsed = JSON.parse(raw) as unknown;
      if (!parsed || typeof parsed !== 'object') return {};

      const next: PersistedExitControls = {};
      Object.entries(parsed as Record<string, unknown>).forEach(([contractId, value]) => {
        if (!value || typeof value !== 'object') return;
        const maybeMap = value as Record<string, unknown>;
        const trailing = parseBooleanFlag(maybeMap.trailing_enabled);
        const stagnation = parseBooleanFlag(maybeMap.stagnation_enabled);
        if (trailing !== undefined || stagnation !== undefined) {
          next[contractId] = {
            trailing_enabled: trailing,
            stagnation_enabled: stagnation,
          };
        }
      });

      return next;
    } catch (error) {
      console.warn('Failed to read persisted exit controls:', error);
      return {};
    }
  };

  const writePersistedExitControls = (value: PersistedExitControls) => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(EXIT_CONTROLS_STORAGE_KEY, JSON.stringify(value));
    } catch (error) {
      console.warn('Failed to persist exit controls:', error);
    }
  };

  const persistExitControlsFromTrades = (trades: FrontendTrade[]) => {
    const next: PersistedExitControls = {};
    trades.forEach((trade) => {
      if (trade.trailing_enabled === undefined && trade.stagnation_enabled === undefined) {
        return;
      }
      next[trade.id] = {
        trailing_enabled: trade.trailing_enabled,
        stagnation_enabled: trade.stagnation_enabled,
      };
    });
    writePersistedExitControls(next);
  };

  const persistExitControlsForTrade = (
    contractId: string,
    patch: Pick<FrontendTrade, 'trailing_enabled' | 'stagnation_enabled'>
  ) => {
    const current = readPersistedExitControls();
    const existing = current[contractId] ?? {};
    current[contractId] = { ...existing, ...patch };
    writePersistedExitControls(current);
  };

  const getStatusBadgeClassName = (status: FrontendTrade['status']) =>
    cn(
      'text-xs',
      status === 'win' && 'border-success text-success',
      status === 'loss' && 'border-destructive text-destructive',
      status === 'open' && 'border-primary text-primary'
    );

  const getToggleKey = (contractId: string, field: ExitControlField): string =>
    `${contractId}:${field}`;

  const isToggleLoading = (contractId: string, field: ExitControlField): boolean =>
    !!exitToggleLoading[getToggleKey(contractId, field)];

  const setTradeControlLocal = (
    contractId: string,
    patch: Pick<FrontendTrade, 'trailing_enabled' | 'stagnation_enabled'>
  ) => {
    setActiveTrades((prev) =>
      prev.map((trade) =>
        trade.id === contractId
          ? { ...trade, ...patch }
          : trade
      )
    );
  };

  const handleExitControlToggle = async (
    trade: FrontendTrade,
    field: ExitControlField,
    checked: boolean
  ) => {
    const contractId = trade.id;
    const loadingKey = getToggleKey(contractId, field);
    const fallbackCurrent = field === 'trailing_enabled'
      ? (trade.trailing_enabled ?? true)
      : (trade.stagnation_enabled ?? true);
    const optimisticPatch: Pick<FrontendTrade, 'trailing_enabled' | 'stagnation_enabled'> =
      field === 'trailing_enabled'
        ? { trailing_enabled: checked }
        : { stagnation_enabled: checked };

    setExitToggleLoading((prev) => ({ ...prev, [loadingKey]: true }));
    setTradeControlLocal(contractId, optimisticPatch);

    try {
      const payload = field === 'trailing_enabled'
        ? { trailing_enabled: checked }
        : { stagnation_enabled: checked };

      const response = await api.trades.updateExitControls(contractId, payload);
      const responseData = response.data as unknown as Record<string, unknown>;
      const responseExitControls =
        responseData.exit_controls && typeof responseData.exit_controls === 'object'
          ? (responseData.exit_controls as Record<string, unknown>)
          : undefined;
      const normalizedTrailing =
        parseBooleanFlag(responseData.trailing_enabled) ??
        parseBooleanFlag(responseExitControls?.trailing_enabled);
      const normalizedStagnation =
        parseBooleanFlag(responseData.stagnation_enabled) ??
        parseBooleanFlag(responseExitControls?.stagnation_enabled);
      const nextState = {
        trailing_enabled: normalizedTrailing ?? (field === 'trailing_enabled' ? checked : (trade.trailing_enabled ?? true)),
        stagnation_enabled: normalizedStagnation ?? (field === 'stagnation_enabled' ? checked : (trade.stagnation_enabled ?? true)),
      };
      setTradeControlLocal(contractId, nextState);
      persistExitControlsForTrade(contractId, nextState);

      const fieldLabel = field === 'trailing_enabled' ? 'Trailing exit' : 'Stagnation exit';
      const finalValue = field === 'trailing_enabled'
        ? nextState.trailing_enabled
        : nextState.stagnation_enabled;
      toast({
        title: `${fieldLabel} ${finalValue ? 'enabled' : 'disabled'}`,
        description: `${fieldLabel} turned ${finalValue ? 'on' : 'off'} for trade ${contractId}.`,
      });
    } catch (error) {
      console.error(`Failed to update ${field} for trade ${contractId}:`, error);
      const rollbackPatch: Pick<FrontendTrade, 'trailing_enabled' | 'stagnation_enabled'> =
        field === 'trailing_enabled'
          ? { trailing_enabled: fallbackCurrent }
          : { stagnation_enabled: fallbackCurrent };
      setTradeControlLocal(contractId, rollbackPatch);
      const fieldLabel = field === 'trailing_enabled' ? 'Trailing exit' : 'Stagnation exit';
      toast({
        title: `Failed to update ${fieldLabel.toLowerCase()}`,
        description: 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setExitToggleLoading((prev) => {
        const next = { ...prev };
        delete next[loadingKey];
        return next;
      });
    }
  };

  const handleSyncTrades = async () => {
    setSyncSubmitting(true);
    try {
      const response = await api.trades.syncActiveTrades();
      const syncResult = response.data;
      await fetchData();

      const importedCount = Number(syncResult?.imported_count || 0);
      const skippedCount = Number(syncResult?.skipped_non_multiplier_ids?.length || 0);
      const failedCount = Number(syncResult?.failed_contract_ids?.length || 0);

      toast({
        title: importedCount > 0 ? 'Sync complete' : 'No new trades to import',
        description: `Imported ${importedCount}, skipped ${skippedCount} non-multiplier, failed ${failedCount}.`,
      });
    } catch (error: any) {
      toast({
        title: 'Sync failed',
        description: error?.response?.data?.detail || 'Could not sync open contracts from broker.',
        variant: 'destructive',
      });
    } finally {
      setSyncSubmitting(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Connection managed by Global Context

    const handleNewTrade = (data: any) => {
      const transformedTrade = transformTrades([data])[0];
      if (!transformedTrade) return;

      const normalizedTrade = normalizeTradeStatus(transformedTrade);
      if (isClosedTrade(normalizedTrade)) {
        setActiveTrades((prev) => prev.filter((t) => t.id !== normalizedTrade.id));
        setHistoryTrades((prev) => mergeHistoryTrades(prev, [normalizedTrade]));
        return;
      }

      setActiveTrades((prev) => [normalizedTrade, ...prev.filter((t) => t.id !== normalizedTrade.id)]);
    };

    const handleTradeClosed = (data: any) => {
      const transformedTrade = transformTrades([data])[0];
      if (!transformedTrade) {
        return;
      }

      const normalizedTrade = normalizeTradeStatus(transformedTrade);
      setActiveTrades((prev) => prev.filter((t) => t.id !== normalizedTrade.id));
      setHistoryTrades((prev) => mergeHistoryTrades(prev, [normalizedTrade]));
    };

    wsService.on('new_trade', handleNewTrade);
    wsService.on('trade_closed', handleTradeClosed);

    return () => {
      wsService.off('new_trade', handleNewTrade);
      wsService.off('trade_closed', handleTradeClosed);
    };
  }, []);

  const fetchData = async () => {
    // Only set loading on initial load, not background refreshes
    if (activeTrades.length === 0 && historyTrades.length === 0) {
      setIsLoading(true);
    }

    try {
      const [activeRes, historyRes, statsRes, configRes] = await Promise.all([
        api.trades.active(),
        api.trades.history(),
        api.trades.stats(),
        api.config.current(),
      ]);

      setHasApiKey(!!configRes.data?.deriv_api_key && configRes.data.deriv_api_key !== '');
      if (configRes.data?.active_strategy) {
        setAccountStrategy(String(configRes.data.active_strategy));
      }

      // Transform backend data to frontend format
      const activeTradesData = transformTrades(activeRes.data || []);
      const historyTradesData = transformTrades(historyRes.data || []);
      const normalizedActiveTrades = activeTradesData.map((trade) => normalizeTradeStatus(trade));
      const closedFromActive = normalizedActiveTrades.filter((trade) => isClosedTrade(trade));
      const stillOpenTrades = normalizedActiveTrades.filter((trade) => !isClosedTrade(trade));
      const mergedHistoryTrades = mergeHistoryTrades(historyTradesData, closedFromActive);
      const reconciledOpenTrades = reconcileActiveTradesWithHistory(stillOpenTrades, mergedHistoryTrades);
      const persistedExitControls = readPersistedExitControls();
      const hydratedOpenTrades = reconciledOpenTrades.map((trade) => {
        const persisted = persistedExitControls[trade.id];
        if (!persisted) return trade;
        return {
          ...trade,
          trailing_enabled: trade.trailing_enabled ?? persisted.trailing_enabled,
          stagnation_enabled: trade.stagnation_enabled ?? persisted.stagnation_enabled,
        };
      });

      // Use backend stats (guard against null/undefined response)
      const statsData = statsRes.data ? transformTradeStats(statsRes.data) : null;

      setActiveTrades(hydratedOpenTrades);
      persistExitControlsFromTrades(hydratedOpenTrades);
      setHistoryTrades(mergedHistoryTrades);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to fetch trades:', {
        error,
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
    } finally {
      setIsLoading(false);
    }
  };

  type TradeWithStrategy = FrontendTrade & { strategy_type?: string | null };
  const filteredHistory = historyTrades.filter((t) => {
    const trade = t as TradeWithStrategy;
    const matchesSearch = trade.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDirection = directionFilter === 'all' || trade.direction === directionFilter;
    const matchesStatus = statusFilter === 'all' || trade.status === statusFilter;
    const strategy = (trade.strategy_type ?? '').toString();
    const matchesStrategy = strategyFilter === 'all' || strategy === strategyFilter;
    return matchesSearch && matchesDirection && matchesStatus && matchesStrategy;
  });

  const exportToCSV = () => {
    const headers = ['Trade ID', 'Symbol', 'Date/Time', 'Strategy', 'Direction', 'Entry Price', 'Exit Price', 'Stake', 'Profit/Loss', 'Duration (s)', 'Status'];
    const rows = filteredHistory.map((trade) => [
      trade.id,
      trade.symbol ?? '',
      trade.time,
      trade.strategy_type ?? '',
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

  const TradeRow = ({ trade }: { trade: FrontendTrade }) => {
    const displayStatus = getDisplayStatus(trade);

    return (
      <tr className="hover:bg-secondary/50 transition-colors">
      <td className="py-3 px-4 font-mono text-sm">{trade.id}</td>
      <td className="py-3 px-4 text-sm text-muted-foreground">{trade.symbol || '-'}</td>
      <td className="py-3 px-4 text-muted-foreground text-sm">{formatDate(trade.time)}</td>
      <td className="py-3 px-4">
        {trade.strategy_type ? (
          <Badge variant="secondary" className="text-[10px] bg-secondary/50 text-muted-foreground border-border/50 font-normal">
            {trade.strategy_type}
          </Badge>
        ) : '-'}
      </td>
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
      <td className="py-3 px-4 font-mono text-sm">
        {trade.entry_price ? formatCurrency(trade.entry_price) : '-'}
      </td>
      <td className="py-3 px-4 font-mono text-sm">
        {trade.exit_price ? formatCurrency(trade.exit_price) : '-'}
      </td>
      <td className="py-3 px-4 font-mono text-sm">
        {trade.stake ? formatCurrency(trade.stake) : '-'}
      </td>
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
          className={getStatusBadgeClassName(displayStatus)}
        >
          {displayStatus.charAt(0).toUpperCase() + displayStatus.slice(1)}
        </Badge>
      </td>
      </tr>
    );
  };

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
          <div className="glass-card p-6 space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-1">
                <h3 className="font-semibold text-foreground">Broker Contract Sync</h3>
                <p className="text-sm text-muted-foreground">
                  Detect open multiplier contracts on Deriv and import missing ones into active tracking.
                </p>
                <p className="text-xs text-muted-foreground">
                  Strategy context: <span className="font-medium text-foreground">{accountStrategy}</span>
                </p>
              </div>
              <Button onClick={handleSyncTrades} disabled={syncSubmitting}>
                {syncSubmitting ? 'Syncing...' : 'Sync Open Trades'}
              </Button>
            </div>
          </div>

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
                          <th>Symbol</th>
                          <th>Time Opened</th>
                          <th>Strategy</th>
                          <th>Direction</th>
                          <th>Entry Price</th>
                          <th>Current Price</th>
                          <th>Stake</th>
                          <th>Unrealized P/L</th>
                          <th>Duration</th>
                          <th>Status</th>
                          <th>Exit Controls</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activeTrades.map((trade) => {
                          const displayStatus = getDisplayStatus(trade);
                          return (
                          <tr key={trade.id} className="hover:bg-secondary/50 transition-colors">
                            <td className="py-3 px-4 font-mono text-sm">{trade.id}</td>
                            <td className="py-3 px-4 text-sm text-muted-foreground">{trade.symbol || '-'}</td>
                            <td className="py-3 px-4 text-muted-foreground text-sm">{formatDate(trade.time)}</td>
                            <td className="py-3 px-4">
                              <div className="flex flex-wrap items-center gap-1">
                                {trade.strategy_type ? (
                                  <Badge variant="secondary" className="text-[10px] bg-secondary/50 text-muted-foreground border-border/50 font-normal">
                                    {trade.strategy_type}
                                  </Badge>
                                ) : '-'}
                                {trade.entry_source === 'manual_imported' && (
                                  <Badge variant="outline" className="text-[10px] border-primary/40 text-primary">
                                    Active and Tracked
                                  </Badge>
                                )}
                              </div>
                            </td>
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
                            <td className="py-3 px-4 font-mono text-sm">
                              {trade.entry_price ? formatCurrency(trade.entry_price) : '-'}
                            </td>
                            <td className="py-3 px-4 font-mono text-sm">
                              {trade.exit_price ? formatCurrency(trade.exit_price) : '-'}
                            </td>
                            <td className="py-3 px-4 font-mono text-sm">
                              {trade.stake ? formatCurrency(trade.stake) : '-'}
                            </td>
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
                                className={getStatusBadgeClassName(displayStatus)}
                              >
                                {displayStatus.charAt(0).toUpperCase() + displayStatus.slice(1)}
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex flex-col gap-2 min-w-[150px]">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-xs text-muted-foreground">Trailing</span>
                                  <Switch
                                    checked={trade.trailing_enabled ?? true}
                                    disabled={isToggleLoading(trade.id, 'trailing_enabled')}
                                    onCheckedChange={(checked) =>
                                      handleExitControlToggle(trade, 'trailing_enabled', checked)
                                    }
                                  />
                                </div>
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-xs text-muted-foreground">Stagnation</span>
                                  <Switch
                                    checked={trade.stagnation_enabled ?? true}
                                    disabled={isToggleLoading(trade.id, 'stagnation_enabled')}
                                    onCheckedChange={(checked) =>
                                      handleExitControlToggle(trade, 'stagnation_enabled', checked)
                                    }
                                  />
                                </div>
                              </div>
                            </td>
                          </tr>
                        )})}
                      </tbody>
                    </table>
                  </div>
                  <div className="md:hidden space-y-4">
                    {activeTrades.map((trade) => (
                      <Card key={trade.id} className="p-4 bg-card border-border">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <span className="font-mono text-xs text-muted-foreground">#{trade.id}</span>
                            <div className="text-xs text-muted-foreground mt-1">{trade.symbol || '-'}</div>
                            <div className="text-sm font-medium mt-1">{formatDate(trade.time)}</div>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <Badge className={cn('text-xs', trade.direction === 'UP' ? 'badge-rise' : 'badge-fall')}>
                              {trade.direction === 'UP' ? <ArrowUp className="w-3 h-3 mr-1" /> : <ArrowDown className="w-3 h-3 mr-1" />}
                              {trade.direction}
                            </Badge>
                            {trade.strategy_type && (
                              <Badge variant="secondary" className="text-[9px] bg-secondary/50 text-muted-foreground font-normal">
                                {trade.strategy_type}
                              </Badge>
                            )}
                            {trade.entry_source === 'manual_imported' && (
                              <Badge variant="outline" className="text-[9px] border-primary/40 text-primary">
                                Active and Tracked
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                          <div>
                            <div className="text-muted-foreground text-xs">Entry</div>
                            <div className="font-mono">{trade.entry_price ? formatCurrency(trade.entry_price) : '-'}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-muted-foreground text-xs">Stake</div>
                            <div className="font-mono">{trade.stake ? formatCurrency(trade.stake) : '-'}</div>
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
                        <div className="pt-3 mt-3 border-t border-border space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">Trailing</span>
                            <Switch
                              checked={trade.trailing_enabled ?? true}
                              disabled={isToggleLoading(trade.id, 'trailing_enabled')}
                              onCheckedChange={(checked) =>
                                handleExitControlToggle(trade, 'trailing_enabled', checked)
                              }
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">Stagnation</span>
                            <Switch
                              checked={trade.stagnation_enabled ?? true}
                              disabled={isToggleLoading(trade.id, 'stagnation_enabled')}
                              onCheckedChange={(checked) =>
                                handleExitControlToggle(trade, 'stagnation_enabled', checked)
                              }
                            />
                          </div>
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
            <Select value={strategyFilter} onValueChange={setStrategyFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Strategy" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Strategies</SelectItem>
                <SelectItem value="Conservative">Conservative (Trend Following)</SelectItem>
                <SelectItem value="Scalping">Scalping (High Frequency)</SelectItem>
                <SelectItem value="RiseFall">Rise/Fall (Binary Options)</SelectItem>
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
                  description="No past trades found for this account."
                  className="border-none bg-transparent"
                />
              ) : (
                <>
                  <div className="hidden md:block">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Trade ID</th>
                          <th>Symbol</th>
                          <th>Date/Time</th>
                          <th>Strategy</th>
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
                    {filteredHistory.map((trade) => {
                      const displayStatus = getDisplayStatus(trade);
                      return (
                      <Card key={trade.id} className="p-4 bg-card border-border">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <span className="font-mono text-xs text-muted-foreground">#{trade.id}</span>
                            <div className="text-xs text-muted-foreground mt-1">{trade.symbol || '-'}</div>
                            <div className="text-sm font-medium mt-1">{formatDate(trade.time)}</div>
                          </div>
                          <Badge
                            variant="outline"
                            className={getStatusBadgeClassName(displayStatus)}
                          >
                            {displayStatus.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                          <div className="flex items-center gap-1 col-span-2 mb-1">
                            <Badge className={cn('text-[10px] h-5 px-1.5', trade.direction === 'UP' ? 'badge-rise' : 'badge-fall')}>
                              {trade.direction === 'UP' ? <ArrowUp className="w-3 h-3 mr-1" /> : <ArrowDown className="w-3 h-3 mr-1" />}
                              {trade.direction}
                            </Badge>
                            {trade.strategy_type && (
                              <Badge variant="secondary" className="text-[10px] h-5 px-1.5 bg-secondary/50 text-muted-foreground font-normal">
                                {trade.strategy_type}
                              </Badge>
                            )}
                          </div>
                          <div>
                            <div className="text-muted-foreground text-xs">Entry</div>
                            <div className="font-mono">{trade.entry_price ? formatCurrency(trade.entry_price) : '-'}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-muted-foreground text-xs">Exit</div>
                            <div className="font-mono">{trade.exit_price ? formatCurrency(trade.exit_price) : '-'}</div>
                          </div>
                        </div>
                        <div className="pt-3 border-t border-border flex justify-between items-center">
                          <div className="text-xs text-muted-foreground">
                            Stake: {trade.stake ? formatCurrency(trade.stake) : '-'}
                          </div>
                          {trade.profit !== undefined ? (
                            <span className={cn('font-mono font-bold text-base', trade.profit >= 0 ? 'profit-positive' : 'profit-negative')}>
                              {trade.profit >= 0 ? '+' : ''}{formatCurrency(trade.profit)}
                            </span>
                          ) : '-'}
                        </div>
                      </Card>
                    )})}
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
