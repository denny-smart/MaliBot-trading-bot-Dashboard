import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { BotControl } from '@/components/dashboard/BotControl';
import { RecentTrades } from '@/components/dashboard/RecentTrades';
import { ProfitChart } from '@/components/dashboard/ProfitChart';
import { LogTerminal } from '@/components/dashboard/LogTerminal';
import { useAuth } from '@/contexts/AuthContext';
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

interface BotStatus {
  status: 'running' | 'stopped';
  uptime: number;
  trades_today: number;
  balance: number;
  profit: number;
  profit_percent: number;
  active_positions: number;
  win_rate: number;
}

export default function Dashboard() {
  const [botStatus, setBotStatus] = useState<FrontendBotStatus | null>(null);
  const [trades, setTrades] = useState<FrontendTrade[]>([]);
  const [profitData, setProfitData] = useState<{ time: string; profit: number }[]>([]);
  const [tradeStats, setTradeStats] = useState<FrontendTradeStats | null>(null); // New state for overall stats
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);
  const [hasApiKey, setHasApiKey] = useState(false);
  const { role } = useAuth();

  useEffect(() => {
    fetchData();
    wsService.connect();

    // Set up auto-refresh every 10 seconds
    const interval = setInterval(fetchData, 10000);
    setRefreshInterval(interval);

    // WebSocket listeners for real-time updates
    wsService.on('bot_status_update', (data: any) => {
      setBotStatus((prev) => {
        const newStatus = transformBotStatus(data);
        // Preserve stake_amount if not present in update (assuming 0 means missing/default if we expect positive stake)
        if (newStatus.stake_amount === 0 && prev?.stake_amount) {
          newStatus.stake_amount = prev.stake_amount;
        }
        return prev ? { ...prev, ...newStatus } : newStatus;
      });
    });

    wsService.on('new_trade', (data: any) => {
      setTrades((prev) => [data, ...prev.slice(0, 9)]);
    });

    wsService.on('trade_closed', (data: any) => {
      setTrades((prev) =>
        prev.map((t) => (t.id === data.id ? { ...t, ...data } : t))
      );
    });

    return () => {
      wsService.disconnect();
      if (interval) clearInterval(interval);
    };
  }, []);

  const fetchData = async () => {
    try {
      setError(null);
      console.log('=== DASHBOARD FETCH START ===');

      // 1. Check for API key FIRST
      const configRes = await api.config.current();
      const hasKey = !!configRes.data?.deriv_api_key && configRes.data.deriv_api_key !== '';
      setHasApiKey(hasKey);

      // Capture config-level settings as fallback
      const configStake = configRes.data?.stake_amount;
      const configStrategy = configRes.data?.active_strategy;

      if (!hasKey) {
        // If no key, reset EVERYTHING to default/empty state
        console.warn("No API key found. Resetting dashboard data.");
        setBotStatus({
          status: 'stopped',
          active_strategy: 'Unknown',
          stake_amount: 0,
          uptime: 0,
          trades_today: 0,
          balance: 0,
          profit: 0,
          profit_percent: 0,
          active_positions: 0,
          win_rate: 0
        });
        setTrades([]);
        setProfitData([]);
        setTradeStats(null); // Reset stats too
        setIsLoading(false);
        return; // Stop here, do not fetch other data
      }

      // 2. Fetch all dashboard data (Only if key exists)
      const statusRes = await api.bot.status();
      const transformedStatus = transformBotStatus(statusRes.data);

      // Merge config values if missing in status
      if (!transformedStatus.stake_amount && configStake) {
        transformedStatus.stake_amount = configStake;
      }
      if ((!transformedStatus.active_strategy || transformedStatus.active_strategy === 'Unknown') && configStrategy) {
        transformedStatus.active_strategy = configStrategy;
      }

      console.log('Transformed Status:', transformedStatus);
      setBotStatus(transformedStatus);

      // Generate profit chart data based on actual profit
      const chartData = generateProfitChartData(
        transformedStatus.profit,
        transformedStatus.trades_today
      );
      setProfitData(chartData);

      // 3. Fetch trades
      try {
        const tradesRes = await api.trades.active();
        console.log('Active Trades Response:', tradesRes.data);
        const activeTrades = transformTrades(tradesRes.data);
        setTrades(activeTrades.slice(0, 10));
      } catch (tradeError) {
        console.warn("Failed to fetch trades:", tradeError);
      }

      // 4. Fetch overall trade statistics
      try {
        const statsRes = await api.trades.stats();
        console.log('Trade Stats Response:', statsRes.data);
        const transformedStats = transformTradeStats(statsRes.data);
        setTradeStats(transformedStats);
      } catch (statsError) {
        console.warn("Failed to fetch trade stats:", statsError);
      }

      console.log('=== DASHBOARD FETCH SUCCESS ===');
    } catch (error: any) {
      const errorMsg = error?.message || 'Unknown error occurred';
      console.error('=== DASHBOARD FETCH ERROR ===');
      console.error('Error:', error);

      // If we know it's a 500 and no key is present (though we checked above), handle gracefully
      if (error?.response?.status === 500) {
        setError("Server returned an error. Please check your configuration.");

        // Reset data just in case
        setBotStatus({
          status: 'stopped',
          active_strategy: 'Unknown',
          stake_amount: 0,
          uptime: 0,
          trades_today: 0,
          balance: 0,
          profit: 0,
          profit_percent: 0,
          active_positions: 0,
          win_rate: 0
        });
        setTrades([]);
        setProfitData([]);
        setTradeStats(null);
      } else {
        setError(`${errorMsg}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleStart = async () => {
    try {
      await api.bot.start();
      setBotStatus((prev) => prev && { ...prev, status: 'running' });
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
      setBotStatus((prev) => prev && { ...prev, status: 'stopped' });
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
      // Fetch current config first to preserve other settings
      const currentConfigRes = await api.config.current();
      const currentConfig = currentConfigRes.data || {};

      // Update with new key
      await api.config.update({
        ...currentConfig,
        deriv_api_key: key
      });

      toast({
        title: 'API Key Updated',
        description: 'Your Deriv API key has been securely saved.'
      });
      setHasApiKey(true);
    } catch (error: any) {
      toast({
        title: 'Failed to update API Key',
        description: error.response?.data?.detail || 'An error occurred',
        variant: 'destructive',
      });
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

  // Calculate Balance Trend (Simulated using profit for today if history is missing)
  const balanceTrend = botStatus?.balance && botStatus.profit
    ? (botStatus.profit / (botStatus.balance - botStatus.profit)) * 100
    : 0;

  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-6">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            {error && (
              <div className="p-4 bg-destructive/10 border border-destructive rounded-lg">
                <p className="text-destructive text-sm font-medium">Error: {error}</p>
                <p className="text-destructive/70 text-xs mt-2">Open console (F12) to see detailed logs</p>
              </div>
            )}
          </div>
          <Button
            onClick={fetchData}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
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
