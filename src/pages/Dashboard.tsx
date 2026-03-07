import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { BotControl } from '@/components/dashboard/BotControl';
import { RecentTrades } from '@/components/dashboard/RecentTrades';
import { ProfitChart } from '@/components/dashboard/ProfitChart';
import { LogTerminal } from '@/components/dashboard/LogTerminal';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Activity,
  Wallet,
  TrendingUp,
  BarChart3,
  Zap,
  Percent,
  RefreshCw,
  Shield,
  Target,
} from 'lucide-react';
import { api } from '@/services/api';
import { wsService } from '@/services/websocket';
import { toast } from '@/hooks/use-toast';
import { formatCurrency, formatDuration } from '@/lib/formatters';
import { Skeleton } from '@/components/ui/skeleton';
import { transformTrades, type FrontendTrade } from '@/lib/tradeTransformers';
import {
  transformBotStatus,
  generateProfitChartData,
  generateProfitChartDataFromTrades,
  transformTradeStats,
  type FrontendBotStatus,
  type FrontendTradeStats
} from '@/lib/dashboardTransformers';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { BackendTrade } from '@/lib/tradeTransformers';

type DashboardConfig = {
  deriv_api_key?: string;
  strategy?: string;
  stake_amount: number;
  active_strategy?: string;
  auto_execute_signals?: boolean;
  [key: string]: unknown;
};

type WebSocketStatsPayload = {
  stats?: Record<string, unknown>;
};

const getErrorDetail = (error: unknown, fallback = 'An error occurred') => {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as { response?: { data?: { detail?: unknown } } }).response;
    const detail = response?.data?.detail;
    if (typeof detail === 'string' && detail.trim()) {
      return detail;
    }
  }

  return fallback;
};

const parseTradeTimeToMs = (value: string): number => {
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const mergeDashboardTrades = (...tradeGroups: FrontendTrade[][]): FrontendTrade[] => {
  const tradeMap = new Map<string, FrontendTrade>();

  tradeGroups.flat().forEach((trade) => {
    tradeMap.set(trade.id, trade);
  });

  return Array.from(tradeMap.values()).sort(
    (a, b) => parseTradeTimeToMs(b.time) - parseTradeTimeToMs(a.time)
  );
};

export default function Dashboard() {
  const { role } = useAuth();
  const queryClient = useQueryClient();
  const [syncingTrades, setSyncingTrades] = useState(false);

  // 1. Fetch Config (Base requirement)
  const { data: configData } = useQuery({
    queryKey: ['config'],
    queryFn: async () => {
      const res = await api.config.current();
      return res.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const hasApiKey = !!configData?.deriv_api_key && configData.deriv_api_key !== '';
  const configStake = configData?.stake_amount;
  const configStrategy = configData?.active_strategy;
  const autoExecuteSignals = Boolean(configData?.auto_execute_signals);

  // 2. Fetch Bot Status
  const { data: botStatus, isLoading: isStatusLoading } = useQuery({
    queryKey: ['botStatus'],
    queryFn: async () => {
      const res = await api.bot.status();
      const transformed = transformBotStatus(res.data);
      // Merge config fallbacks
      if (!transformed.stake_amount && configStake) transformed.stake_amount = configStake;
      if ((!transformed.active_strategy || transformed.active_strategy === 'Unknown') && configStrategy) {
        transformed.active_strategy = configStrategy;
      }
      return transformed;
    },
    enabled: hasApiKey,
    refetchInterval: 30000,
  });

  // 3. Fetch Trades
  const { data: trades = [], isLoading: isTradesLoading } = useQuery({
    queryKey: ['trades'],
    queryFn: async () => {
      const [active, history] = await Promise.all([
        api.trades.active().catch(() => ({ data: [] })),
        api.trades.history().catch(() => ({ data: [] }))
      ]);
      const activeTrades = transformTrades(active.data || []);
      const historyTrades = transformTrades(history.data || []);

      return mergeDashboardTrades(historyTrades, activeTrades);
    },
    enabled: hasApiKey,
    refetchInterval: 30000,
  });

  // 4. Fetch Stats
  const { data: tradeStats } = useQuery({
    queryKey: ['tradeStats'],
    queryFn: async () => {
      const res = await api.trades.stats();
      return transformTradeStats(res.data);
    },
    enabled: hasApiKey,
    refetchInterval: 1000 * 60 * 5, // 5 minutes
  });

  // WebSocket Integration
  useEffect(() => {
    // Connection is now managed by NotificationContext/Global

    const handleBotStatus = (data: unknown) => {
      console.log('Dashboard received bot_status event:', data);

      const eventData = data && typeof data === 'object'
        ? (data as Record<string, unknown>)
        : {};

      queryClient.setQueryData(['botStatus'], (prev: FrontendBotStatus | undefined) => {
        const newStatus = transformBotStatus(eventData);

        // Explicitly preserve and update balance from event
        if (eventData.balance !== undefined && eventData.balance !== null) {
          newStatus.balance = Number(eventData.balance);
          console.log('Updated balance from websocket:', newStatus.balance);
        }

        if (newStatus.stake_amount === 0 && prev?.stake_amount) {
          newStatus.stake_amount = prev.stake_amount;
        }

        console.log('Final transformed bot status:', newStatus);
        return prev ? { ...prev, ...newStatus } : newStatus;
      });
    };

    const handleNewTrade = (data: unknown) => {
      const transformedTrade = transformTrades([data as BackendTrade])[0];
      if (!transformedTrade) return;

      queryClient.setQueryData(['trades'], (prev: FrontendTrade[] | undefined) => {
        return mergeDashboardTrades([transformedTrade], prev || []);
      });
    };

    const handleTradeClosed = (data: unknown) => {
      const transformedTrade = transformTrades([data as BackendTrade])[0];
      if (!transformedTrade) return;

      queryClient.setQueryData(['trades'], (prev: FrontendTrade[] | undefined) => {
        return mergeDashboardTrades([transformedTrade], prev || []);
      });

      // Update bot status (balance and profit)
      queryClient.setQueryData(['botStatus'], (prev: FrontendBotStatus | undefined) => {
        if (!prev) return undefined;

        const tradeProfit = transformedTrade.profit || 0;

        return {
          ...prev,
          balance: prev.balance + tradeProfit,
          profit: prev.profit + tradeProfit
        };
      });
    };

    wsService.on('bot_status', handleBotStatus);
    wsService.on('statistics', (data: unknown) => {
      console.log('Dashboard received statistics event:', data);
      const eventData = data && typeof data === 'object'
        ? (data as WebSocketStatsPayload)
        : {};

      queryClient.setQueryData(['tradeStats'], (prev: FrontendTradeStats | undefined) => {
        console.log('Updated trade stats from websocket:', eventData.stats);
        return eventData.stats ? transformTradeStats(eventData.stats) : prev;
      });
      // Also invalidate to trigger fresh fetch
      queryClient.invalidateQueries({ queryKey: ['tradeStats'] });
    });
    wsService.on('new_trade', handleNewTrade);
    wsService.on('trade_closed', handleTradeClosed);

    return () => {
      wsService.off('bot_status', handleBotStatus);
      wsService.off('new_trade', handleNewTrade);
      wsService.off('trade_closed', handleTradeClosed);
    };
  }, [queryClient]);

  const handleStart = async () => {
    try {
      await api.bot.start();
      queryClient.setQueryData(['botStatus'], (prev: FrontendBotStatus | undefined) => prev && { ...prev, status: 'running' });
      toast({ title: 'Bot Started', description: 'Trading bot is now running.' });
    } catch (error: unknown) {
      toast({
        title: 'Failed to start bot',
        description: getErrorDetail(error),
        variant: 'destructive',
      });
    }
  };

  const handleStop = async () => {
    try {
      await api.bot.stop();
      queryClient.setQueryData(['botStatus'], (prev: FrontendBotStatus | undefined) => prev && { ...prev, status: 'stopped' });
      toast({ title: 'Bot Stopped', description: 'Trading bot has been stopped.' });
    } catch (error: unknown) {
      toast({
        title: 'Failed to stop bot',
        description: getErrorDetail(error),
        variant: 'destructive',
      });
    }
  };

  const handleRestart = async () => {
    try {
      await api.bot.restart();
      toast({ title: 'Bot Restarted', description: 'Trading bot has been restarted.' });
    } catch (error: unknown) {
      toast({
        title: 'Failed to restart bot',
        description: getErrorDetail(error),
        variant: 'destructive',
      });
    }
  };

  const handleUpdateApiKey = async (key: string) => {
    try {
      const currentConfigRes = await api.config.current();
      await api.config.update({ ...currentConfigRes.data, deriv_api_key: key });
      await queryClient.invalidateQueries({ queryKey: ['config'] });
      toast({ title: 'API Key Updated', description: 'Your Deriv API key has been securely saved.' });
    } catch (error: unknown) {
      toast({
        title: 'Failed to update API Key',
        description: getErrorDetail(error),
        variant: 'destructive',
      });
    }
  };

  const isLoading = isStatusLoading || isTradesLoading;

  // Manual Refresh
  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['botStatus'] });
    queryClient.invalidateQueries({ queryKey: ['trades'] });
    queryClient.invalidateQueries({ queryKey: ['tradeStats'] });
  };

  const handleToggleAutoExecuteSignals = async (enabled: boolean) => {
    queryClient.setQueryData(['config'], (prev: DashboardConfig | undefined) =>
      prev ? { ...prev, auto_execute_signals: enabled } : { auto_execute_signals: enabled }
    );
    try {
      await api.config.update({ auto_execute_signals: enabled });
      await queryClient.invalidateQueries({ queryKey: ['config'] });
      toast({
        title: enabled ? 'Auto execution enabled' : 'Manual mode enabled',
        description: enabled
          ? 'Signals will be executed automatically.'
          : 'Signals will be notifications only until you enable auto execution.',
      });
    } catch (error: unknown) {
      await queryClient.invalidateQueries({ queryKey: ['config'] });
      toast({
        title: 'Failed to update execution mode',
        description: getErrorDetail(error),
        variant: 'destructive',
      });
    }
  };

  const handleSyncTrades = async () => {
    setSyncingTrades(true);
    try {
      const res = await api.trades.syncActiveTrades();
      const importedCount = Number(res.data?.imported_count || 0);
      handleRefresh();
      toast({
        title: importedCount > 0 ? 'Trade sync complete' : 'No new trades found',
        description: `Imported ${importedCount} open contract(s) from broker.`,
      });
    } catch (error: unknown) {
      toast({
        title: 'Trade sync failed',
        description: getErrorDetail(error, 'Could not sync open contracts.'),
        variant: 'destructive',
      });
    } finally {
      setSyncingTrades(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Dashboard">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-lg" />
            ))}
          </div>
          <Skeleton className="h-40 rounded-lg" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-[400px] rounded-lg" />
            <Skeleton className="h-[400px] rounded-lg" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Calculate Balance Trend
  const balanceTrend = botStatus?.balance && botStatus.profit
    ? (botStatus.profit / (botStatus.balance - botStatus.profit)) * 100
    : 0;

  const profitDataFromTrades = generateProfitChartDataFromTrades(trades);
  const profitData = profitDataFromTrades.length > 0
    ? profitDataFromTrades
    : generateProfitChartData(botStatus?.profit || 0, botStatus?.trades_today || 0);
  const recentTrades = trades.slice(0, 50);

  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-6">
        {/* Top Action Bar */}
        <div className="flex justify-end">
          <Button
            onClick={handleSyncTrades}
            size="sm"
            disabled={syncingTrades}
            className={cn(
              "gap-2 bg-zinc-700 text-zinc-100 border border-zinc-600 hover:bg-zinc-600 hover:text-white transition-all duration-200",
              syncingTrades && "opacity-70 cursor-not-allowed"
            )}
          >
            <RefreshCw className={cn("w-4 h-4", syncingTrades && "animate-spin")} />
            {syncingTrades ? 'Syncing...' : 'Sync Trades'}
          </Button>
        </div>

        {/* Role Badge & Status */}
        <div className="flex items-center gap-3">
          <Badge className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-none text-sm px-4 py-1.5 rounded-full font-medium">
            Role: {role ? role.charAt(0).toUpperCase() + role.slice(1) : 'User'}
          </Badge>
          {botStatus?.active_strategy && (
            <Badge className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-none text-sm px-4 py-1.5 flex items-center gap-1.5 rounded-full font-medium">
              <Shield className="w-3 h-3" />
              Strategy: {botStatus.active_strategy}
            </Badge>
          )}
          {botStatus?.stake_amount !== undefined && (
            <Badge className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-none text-sm px-4 py-1.5 flex items-center gap-1.5 rounded-full font-medium">
              <Target className="w-3 h-3" />
              Stake: ${botStatus.stake_amount}
            </Badge>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <StatsCard
            title="Bot Status"
            value={botStatus?.status === 'running' ? 'Running' : 'Stopped'}
            subtitle={`Uptime: ${formatDuration(botStatus?.uptime || 0)}`}
            icon={Activity}
            variant={botStatus?.status === 'running' ? 'success' : 'danger'}
            pulse={true}
          />
          <StatsCard
            title="Account Balance"
            value={formatCurrency(botStatus?.balance || 0)}
            icon={Wallet}
            trend={{
              value: Number(balanceTrend.toFixed(1)),
              label: 'today'
            }}
          />
          <StatsCard
            title="Today's P/L"
            value={formatCurrency(botStatus?.profit || 0)}
            icon={TrendingUp}
            variant={(botStatus?.profit || 0) >= 0 ? 'success' : 'danger'}
            trend={{
              value: botStatus?.profit_percent || 0,
              label: 'today',
            }}
          />
          <StatsCard
            title="Trades Today"
            value={botStatus?.trades_today || 0}
            icon={BarChart3}
            subtitle={`Daily average: ${tradeStats?.daily_average || 0}`}
          />
          <StatsCard
            title="Active Positions"
            value={botStatus?.active_positions || 0}
            icon={Zap}
            variant="default"
          />
          <StatsCard
            title="Win Rate"
            value={`${(botStatus?.win_rate || 0).toFixed(1)}%`}
            icon={Percent}
            variant={
              (botStatus?.win_rate || 0) >= 50 ? 'success' : 'danger'
            }
            subtitle={`Overall: ${(tradeStats?.win_rate || 0).toFixed(1)}%`}
          />
        </div>

        {/* Bot Control */}
        <BotControl
          status={botStatus?.status || 'stopped'}
          hasApiKey={hasApiKey}
          activeStrategy={botStatus?.active_strategy}
          autoExecuteSignals={autoExecuteSignals}
          onStart={handleStart}
          onStop={handleStop}
          onRestart={handleRestart}
          onToggleAutoExecuteSignals={handleToggleAutoExecuteSignals}
          onUpdateApiKey={handleUpdateApiKey}
        />

        {/* Charts and Trades */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentTrades trades={recentTrades} />
          <ProfitChart data={profitData} />
        </div>

        {/* Live Bot Logs */}
        <LogTerminal />
      </div>
    </DashboardLayout>
  );
}
