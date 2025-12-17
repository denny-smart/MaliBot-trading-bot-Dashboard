import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { BotControl } from '@/components/dashboard/BotControl';
import { RecentTrades } from '@/components/dashboard/RecentTrades';
import { ProfitChart } from '@/components/dashboard/ProfitChart';
import {
  Activity,
  Wallet,
  TrendingUp,
  BarChart3,
  Zap,
  Percent,
} from 'lucide-react';
import { api } from '@/services/api';
import { wsService } from '@/services/websocket';
import { toast } from '@/hooks/use-toast';
import { formatCurrency, formatDuration } from '@/lib/formatters';
import { Skeleton } from '@/components/ui/skeleton';
import { transformTrades, type FrontendTrade } from '@/lib/tradeTransformers';
import { transformBotStatus, generateProfitChartData, type FrontendBotStatus } from '@/lib/dashboardTransformers';

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
  const [isLoading, setIsLoading] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchData();
    wsService.connect();

    // Set up auto-refresh every 10 seconds
    const interval = setInterval(fetchData, 10000);
    setRefreshInterval(interval);

    // WebSocket listeners for real-time updates
    wsService.on('bot_status_update', (data: any) => {
      setBotStatus((prev) => prev ? { ...prev, ...transformBotStatus(data) } : transformBotStatus(data));
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
      const [statusRes, tradesRes, statsRes] = await Promise.all([
        api.bot.status(),
        api.trades.active(),
        api.trades.stats(),
      ]);

      // Transform bot status
      const transformedStatus = transformBotStatus(statusRes.data);
      setBotStatus(transformedStatus);
      
      // Transform active trades to frontend format
      const activeTrades = transformTrades(tradesRes.data || []);
      setTrades(activeTrades.slice(0, 10));

      // Generate profit chart data based on actual profit
      const chartData = generateProfitChartData(
        transformedStatus.profit,
        transformedStatus.trades_today
      );
      setProfitData(chartData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
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

  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-6">
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
            trend={{ value: 2.5, label: 'vs yesterday' }}
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
            subtitle="Daily average: 45"
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
            subtitle="Overall: 54.2%"
          />
        </div>

        {/* Bot Control */}
        <BotControl
          status={botStatus?.status || 'stopped'}
          onStart={handleStart}
          onStop={handleStop}
          onRestart={handleRestart}
        />

        {/* Charts and Trades */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentTrades trades={trades} />
          <ProfitChart data={profitData} />
        </div>
      </div>
    </DashboardLayout>
  );
}
