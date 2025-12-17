import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/services/api';
import { formatDate } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { Signal, Cpu, HardDrive, Activity, Wifi, CheckCircle2, AlertCircle } from 'lucide-react';

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
  const [signals, setSignals] = useState<SignalData[]>([]);
  const [performance, setPerformance] = useState<PerformanceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [signalsRes, performanceRes] = await Promise.all([
        api.monitor.signals(),
        api.monitor.performance(),
      ]);

      setSignals(signalsRes.data?.signals || []);
      setPerformance(performanceRes.data);
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
        <TabsList className="bg-secondary">
          <TabsTrigger value="signals">Signals</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="signals" className="space-y-4">
          <div className="stat-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Trading Signals</h3>
              <Badge variant="secondary" className="text-xs">Auto-refresh: 30s</Badge>
            </div>
            <ScrollArea className="h-[500px]">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Signal Type</th>
                    <th>Confidence</th>
                    <th>Market Conditions</th>
                    <th>Action Taken</th>
                    <th>Result</th>
                  </tr>
                </thead>
                <tbody>
                  {signals.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-muted-foreground">
                        No signals recorded
                      </td>
                    </tr>
                  ) : (
                    signals.map((signal) => (
                      <tr key={signal.id} className="hover:bg-secondary/50 transition-colors">
                        <td className="py-3 px-4 text-sm text-muted-foreground">
                          {formatDate(signal.timestamp)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Signal className="w-4 h-4 text-primary" />
                            <span className="text-sm font-medium">{signal.signal_type}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Progress
                              value={signal.confidence}
                              className={cn(
                                'h-2 w-20',
                                signal.confidence >= 70 && '[&>div]:bg-success',
                                signal.confidence >= 40 && signal.confidence < 70 && '[&>div]:bg-warning',
                                signal.confidence < 40 && '[&>div]:bg-destructive'
                              )}
                            />
                            <span className="text-xs text-muted-foreground">{signal.confidence}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm">{signal.market_conditions}</td>
                        <td className="py-3 px-4 text-sm">{signal.action_taken}</td>
                        <td className="py-3 px-4">
                          <Badge
                            variant="outline"
                            className={cn(
                              'text-xs',
                              signal.result === 'success' && 'border-success text-success',
                              signal.result === 'failed' && 'border-destructive text-destructive',
                              signal.result === 'pending' && 'border-warning text-warning'
                            )}
                          >
                            {signal.result}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </ScrollArea>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Uptime */}
            <div className="stat-card">
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
            <div className="stat-card">
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
            <div className="stat-card">
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
            <div className="stat-card">
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
            <div className="stat-card">
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
            <div className="stat-card">
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
