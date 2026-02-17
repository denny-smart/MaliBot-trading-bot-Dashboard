import { useEffect } from 'react';
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
  transformTradeStats,
  type FrontendBotStatus,
  type FrontendTradeStats
} from '@/lib/dashboardTransformers';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export default function Dashboard() {
  const { role } = useAuth();
  const queryClient = useQueryClient();

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

      const tradeMap = new Map<string, FrontendTrade>();
      historyTrades.forEach(t => tradeMap.set(t.id, t));
      activeTrades.forEach(t => tradeMap.set(t.id, t));

      return Array.from(tradeMap.values())
        .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
        .slice(0, 50);
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

    const handleBotStatus = (data: any) => {
      queryClient.setQueryData(['botStatus'], (prev: FrontendBotStatus | undefined) => {
        const newStatus = transformBotStatus(data);
        if (newStatus.stake_amount === 0 && prev?.stake_amount) {
          newStatus.stake_amount = prev.stake_amount;
        }
        return prev ? { ...prev, ...newStatus } : newStatus;
      });
    };

    const handleNewTrade = (data: any) => {
      const transformedTrade = transformTrades([data])[0];
      queryClient.setQueryData(['trades'], (prev: FrontendTrade[] | undefined) => {
        const currentData = prev || [];
        return [transformedTrade, ...currentData.slice(0, 49)];
      });
    };

    const handleTradeClosed = (data: any) => {
      const transformedTrade = transformTrades([data])[0];

      // Update trades list
      queryClient.setQueryData(['trades'], (prev: FrontendTrade[] | undefined) => {
        return prev?.map((t) => (t.id === transformedTrade.id ? { ...t, ...transformedTrade } : t)) ?? [];
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

    wsService.on('bot_status_update', handleBotStatus);
    wsService.on('new_trade', handleNewTrade);
    wsService.on('trade_closed', handleTradeClosed);

    return () => {
      wsService.off('bot_status_update', handleBotStatus);
      wsService.off('new_trade', handleNewTrade);
      wsService.off('trade_closed', handleTradeClosed);
    };
  }, [queryClient]);

  const handleStart = async () => {
    try {
      await api.bot.start();
      queryClient.setQueryData(['botStatus'], (prev: any) => prev && { ...prev, status: 'running' });
      toast({ title: 'Bot Started', description: 'Trading bot is now running.' });
    } catch (error: any) {
      toast({
        title: 'Failed to start bot',
        description: error.response?.data?.detail || 'An error occurred',
        variant: 'destructive',
      });
    }
  };

  const handleStop = async () => {
    try {
      await api.bot.stop();
      queryClient.setQueryData(['botStatus'], (prev: any) => prev && { ...prev, status: 'stopped' });
      toast({ title: 'Bot Stopped', description: 'Trading bot has been stopped.' });
    } catch (error: any) {
      toast({
        title: 'Failed to stop bot',
        description: error.response?.data?.detail || 'An error occurred',
        variant: 'destructive',
      });
    }
  };

  const handleRestart = async () => {
    try {
      await api.bot.restart();
      toast({ title: 'Bot Restarted', description: 'Trading bot has been restarted.' });
    } catch (error: any) {
      toast({
        title: 'Failed to restart bot',
        description: error.response?.data?.detail || 'An error occurred',
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
    } catch (error: any) {
      toast({
        title: 'Failed to update API Key',
        description: error.response?.data?.detail || 'An error occurred',
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

  const profitData = generateProfitChartData(botStatus?.profit || 0, botStatus?.trades_today || 0);

  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-6">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            {/* Error handling usually at query level now, but we can check isError */}
          </div>
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <RefreshCw className={cn("w-4 h-4", isStatusLoading && "animate-spin")} />
            Refresh
          </Button>
        </div>

        {/* Role Badge & Status */}
        <div className="flex items-center gap-2">
          <Badge variant={role === 'admin' ? 'default' : 'secondary'} className="text-sm px-3 py-1">
            Role: {role ? role.charAt(0).toUpperCase() + role.slice(1) : 'User'}
          </Badge>
          {botStatus?.active_strategy && (
            <Badge variant="outline" className="text-sm px-3 py-1 flex items-center gap-1">
              <Shield className="w-3 h-3" />
              Strategy: {botStatus.active_strategy}
            </Badge>
          )}
          {botStatus?.stake_amount !== undefined && (
            <Badge variant="outline" className="text-sm px-3 py-1 flex items-center gap-1">
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
          onStart={handleStart}
          onStop={handleStop}
          onRestart={handleRestart}
          onUpdateApiKey={handleUpdateApiKey}
        />

        {/* Charts and Trades */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentTrades trades={trades} />
          <ProfitChart data={profitData} />
        </div>

        {/* Live Bot Logs */}
        <LogTerminal />
      </div>
    </DashboardLayout>
  );
}
