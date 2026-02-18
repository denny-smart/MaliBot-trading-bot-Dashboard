import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/services/api';
import { formatDate, formatDuration } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { Signal, Cpu, HardDrive, Activity, Wifi, CheckCircle2, AlertCircle } from 'lucide-react';
import { transformSignals, transformPerformance, transformSignal, type FrontendSignal, type FrontendPerformance } from '@/lib/monitoringTransformers';
import { transformBotStatus } from '@/lib/dashboardTransformers';
import { wsService } from '@/services/websocket';

interface SignalData {
  id: string;
  timestamp: string;
  signal_type: string;
  confidence: number;
  market_conditions: string;
  action_taken: string;
  result: string;
}

interface PerformanceData {
  uptime: string;
  cpu_usage: number;
  memory_usage: number;
  active_connections: number;
  error_rate: number;
  request_success_rate: number;
}

export default function Monitoring() {
  const [signals, setSignals] = useState<FrontendSignal[]>([]);
  const [performance, setPerformance] = useState<FrontendPerformance | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Keep polling as fallback and for system metrics

    // WebSocket Listeners
    const handleSignal = (data: any) => {
      setSignals(prev => {
        // Transform the incoming signal
        const newSignal = transformSignal(data, 0); // index 0 is fine for single signal id

        // Deduplicate: check if this signal timestamp already exists
        const exists = prev.some(s =>
          s.timestamp === newSignal.timestamp &&
          s.signal_type === newSignal.signal_type
        );

        if (exists) return prev;

        // Add to the top and keep top 50
        return [newSignal, ...prev].slice(0, 50);
      });
    };

    const handleBotStatus = (data: any) => {
      const botStatus = transformBotStatus(data);
      if (botStatus.uptime > 0) {
        setPerformance(prev => prev ? {
          ...prev,
          uptime: formatDuration(botStatus.uptime)
        } : null);
      }
    };

    wsService.on('signal', handleSignal);
    wsService.on('bot_status', handleBotStatus);

    return () => {
      clearInterval(interval);
      wsService.off('signal', handleSignal);
      wsService.off('bot_status', handleBotStatus);
    };
  }, []);

  const fetchData = async () => {
    try {
      const [signalsRes, performanceRes, botStatusRes] = await Promise.all([
        api.monitor.signals(),
        api.monitor.performance(),
        api.bot.status(),
      ]);

      // Transform backend data to frontend format
      const transformedSignals = transformSignals(signalsRes.data || []);
      const transformedPerformance = transformPerformance(performanceRes.data);
      const botStatus = transformBotStatus(botStatusRes.data);

      // Override uptime with reliable data from bot status
      if (botStatus && botStatus.uptime > 0) {
        transformedPerformance.uptime = formatDuration(botStatus.uptime);
      }

      // Merge signals with deduplication
      setSignals(prev => {
        const merged = [...transformedSignals];
        // Add localized WS signals if they aren't in the fetch result
        prev.forEach(wsSignal => {
          if (!merged.some(s => s.timestamp === wsSignal.timestamp && s.signal_type === wsSignal.signal_type)) {
            merged.push(wsSignal);
          }
        });
        // Re-sort by timestamp descending
        return merged.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 50);
      });

      setPerformance(transformedPerformance);
    } catch (error) {
      console.error('Failed to fetch monitoring data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Monitoring">
        <div className="space-y-6">
          <Skeleton className="h-12 w-96" />
          <Skeleton className="h-[600px]" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Monitoring">
      <Tabs defaultValue="signals" className="space-y-6">
        <TabsList className="glass-panel p-1">
          <TabsTrigger value="signals">Signals</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="signals" className="space-y-4">
          <div className="glass-card p-6 flex flex-col h-[600px]">
            <div className="flex items-center justify-between mb-6 flex-shrink-0">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Signal className="w-5 h-5 text-primary" />
                Trading Signals
              </h3>
              <Badge variant="secondary" className="text-xs bg-white/5 hover:bg-white/10 text-muted-foreground border-white/5">
                Real-time updates enabled
              </Badge>
            </div>

            <div className="flex-1 min-h-0 relative rounded-lg border border-white/5 bg-white/5 overflow-hidden flex flex-col">
              {/* Table Header */}
              <div className="hidden md:grid grid-cols-6 gap-4 p-4 border-b border-white/5 bg-white/5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                <div>Time</div>
                <div>Signal Type</div>
                <div>Confidence</div>
                <div>Market</div>
                <div>Action</div>
                <div className="text-right">Result</div>
              </div>

              {/* Table Body */}
              <ScrollArea className="flex-1">
                {signals.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-4 p-8">
                    <div className="p-4 rounded-full bg-white/5 ring-1 ring-white/10">
                      <Signal className="w-8 h-8 opacity-40" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-foreground">No signals detected</p>
                      <p className="text-xs opacity-50 mt-1 max-w-[200px]">The system is monitoring the market for trading opportunities.</p>
                    </div>
                  </div>
                ) : (
                  <div className="divide-y divide-white/5">
                    {signals.map((signal) => (
                      <div key={signal.id} className="group hover:bg-white/5 transition-colors">
                        {/* Mobile View */}
                        <div className="p-4 space-y-3 md:hidden">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs text-muted-foreground">{formatDate(signal.timestamp)}</span>
                              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[10px] px-1.5 h-5">
                                {signal.signal_type}
                              </Badge>
                            </div>
                            <Badge
                              variant="outline"
                              className={cn(
                                'text-[10px] px-2 py-0.5 border-0 font-medium',
                                (signal.result === 'success' || signal.result === 'Won') && 'bg-success/10 text-success',
                                (signal.result === 'failed' || signal.result === 'Lost') && 'bg-destructive/10 text-destructive',
                                (signal.result === 'pending' || signal.result === 'Pending') && 'bg-warning/10 text-warning',
                                signal.result === 'Skipped' && 'bg-muted text-muted-foreground opacity-70'
                              )}
                            >
                              {signal.result.toUpperCase()}
                            </Badge>
                          </div>

                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">Confidence</span>
                              <span className="font-mono">{signal.confidence}%</span>
                            </div>
                            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden w-full">
                              <div
                                className={cn(
                                  "h-full rounded-full",
                                  signal.confidence >= 70 ? "bg-success" :
                                    signal.confidence >= 40 ? "bg-warning" : "bg-destructive"
                                )}
                                style={{ width: `${signal.confidence}%` }}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-xs">
                            <div>
                              <span className="text-muted-foreground block mb-1 uppercase tracking-wider text-[10px]">Market</span>
                              <span className="text-foreground">{signal.market_conditions}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground block mb-1 uppercase tracking-wider text-[10px]">Action</span>
                              <div className="font-medium text-foreground">{signal.action_taken}</div>
                            </div>
                          </div>
                        </div>

                        {/* Desktop View */}
                        <div className="hidden md:grid grid-cols-6 gap-4 p-4 text-sm items-center">
                          <div className="font-mono text-muted-foreground text-xs">
                            {formatDate(signal.timestamp)}
                          </div>
                          <div>
                            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                              {signal.signal_type}
                            </Badge>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden w-24">
                                <div
                                  className={cn(
                                    "h-full rounded-full",
                                    signal.confidence >= 70 ? "bg-success" :
                                      signal.confidence >= 40 ? "bg-warning" : "bg-destructive"
                                  )}
                                  style={{ width: `${signal.confidence}%` }}
                                />
                              </div>
                              <span className="text-xs font-mono">{signal.confidence}%</span>
                            </div>
                          </div>
                          <div className="text-muted-foreground">
                            {signal.market_conditions}
                          </div>
                          <div className="font-medium text-foreground">
                            {signal.action_taken}
                          </div>
                          <div className="text-right">
                            <Badge
                              variant="outline"
                              className={cn(
                                'text-[10px] px-2 py-0.5 border-0 font-medium',
                                (signal.result === 'success' || signal.result === 'Won') && 'bg-success/10 text-success',
                                (signal.result === 'failed' || signal.result === 'Lost') && 'bg-destructive/10 text-destructive',
                                (signal.result === 'pending' || signal.result === 'Pending') && 'bg-warning/10 text-warning',
                                signal.result === 'Skipped' && 'bg-muted text-muted-foreground opacity-70'
                              )}
                            >
                              {signal.result.toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Uptime */}
            <div className="glass-card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">System Uptime</p>
                  <p className="text-2xl font-bold text-foreground mt-2">
                    {performance?.uptime || '0h 0m'}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-success/20">
                  <CheckCircle2 className="w-6 h-6 text-success" />
                </div>
              </div>
            </div>

            {/* CPU Usage */}
            <div className="glass-card p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-muted-foreground">CPU Usage</p>
                <Cpu className="w-5 h-5 text-primary" />
              </div>
              <p className="text-2xl font-bold text-foreground mb-2">
                {(performance?.cpu_usage || 0).toFixed(1)}%
              </p>
              <Progress
                value={performance?.cpu_usage || 0}
                className={cn(
                  'h-2',
                  (performance?.cpu_usage || 0) >= 80 && '[&>div]:bg-destructive',
                  (performance?.cpu_usage || 0) >= 60 && (performance?.cpu_usage || 0) < 80 && '[&>div]:bg-warning'
                )}
              />
            </div>

            {/* Memory Usage */}
            <div className="glass-card p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-muted-foreground">Memory Usage</p>
                <HardDrive className="w-5 h-5 text-primary" />
              </div>
              <p className="text-2xl font-bold text-foreground mb-2">
                {(performance?.memory_usage || 0).toFixed(1)}%
              </p>
              <Progress
                value={performance?.memory_usage || 0}
                className={cn(
                  'h-2',
                  (performance?.memory_usage || 0) >= 80 && '[&>div]:bg-destructive',
                  (performance?.memory_usage || 0) >= 60 && (performance?.memory_usage || 0) < 80 && '[&>div]:bg-warning'
                )}
              />
            </div>

            {/* Active Connections */}
            <div className="glass-card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Connections</p>
                  <p className="text-2xl font-bold text-foreground mt-2">
                    {performance?.active_connections || 0}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-primary/20">
                  <Wifi className="w-6 h-6 text-primary" />
                </div>
              </div>
            </div>

            {/* Error Rate */}
            <div className="glass-card p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-muted-foreground">Error Rate</p>
                <AlertCircle className="w-5 h-5 text-destructive" />
              </div>
              <p className={cn(
                'text-2xl font-bold',
                (performance?.error_rate || 0) > 5 ? 'text-destructive' : 'text-success'
              )}>
                {(performance?.error_rate || 0).toFixed(2)}%
              </p>
              <Progress
                value={performance?.error_rate || 0}
                className="h-2 [&>div]:bg-destructive"
              />
            </div>

            {/* Success Rate */}
            <div className="glass-card p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-muted-foreground">Request Success Rate</p>
                <Activity className="w-5 h-5 text-success" />
              </div>
              <p className="text-2xl font-bold text-success">
                {(performance?.request_success_rate || 0).toFixed(1)}%
              </p>
              <Progress
                value={performance?.request_success_rate || 0}
                className="h-2 [&>div]:bg-success"
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
