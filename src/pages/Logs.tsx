import { useEffect, useState, useRef } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { api } from '@/services/api';
import { wsService } from '@/services/websocket';
import { formatDate } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { Search, Download, Trash2, ArrowDown, RefreshCw } from 'lucide-react';

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARNING' | 'ERROR' | 'DEBUG';
  message: string;
  source?: string;
}

export default function Logs() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [autoScroll, setAutoScroll] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchLogs();

    // WebSocket listener for real-time logs
    wsService.on('log_message', (data: any) => {
      setLogs((prev) => [...prev, data].slice(-500)); // Keep last 500 logs
    });

    return () => {
      wsService.off('log_message', () => {});
    };
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchLogs();
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (autoScroll && scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [logs, autoScroll]);

  const parseLogString = (logString: string, index: number): LogEntry => {
    // Format: "2025-12-17 10:19:06 | INFO | [OK] Fetched 150 candles (60s)"
    const match = logString.match(/^(.+?)\s*\|\s*([A-Z]+)\s*\|\s*(.+)$/);
    if (match) {
      const [, timestamp, level, message] = match;
      return {
        id: `log-${index}`,
        timestamp: timestamp.trim(),
        level: (level.trim() as 'INFO' | 'WARNING' | 'ERROR' | 'DEBUG') || 'INFO',
        message: message.trim(),
      };
    }
    // Fallback for unparseable logs
    return {
      id: `log-${index}`,
      timestamp: new Date().toISOString(),
      level: 'INFO',
      message: logString,
    };
  };

  const fetchLogs = async () => {
    try {
      const response = await api.monitor.logs();
      const logsData = response.data?.logs || [];
      // Parse string logs into LogEntry objects
      const parsedLogs = logsData.map((log: string | LogEntry, index: number) =>
        typeof log === 'string' ? parseLogString(log, index) : log
      );
      setLogs(parsedLogs);
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    }
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch = (log.message || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = levelFilter === 'all' || log.level === levelFilter;
    return matchesSearch && matchesLevel;
  });

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'INFO':
        return 'bg-primary/20 text-primary border-primary/30';
      case 'WARNING':
        return 'bg-warning/20 text-warning border-warning/30';
      case 'ERROR':
        return 'bg-destructive/20 text-destructive border-destructive/30';
      case 'DEBUG':
        return 'bg-muted text-muted-foreground border-muted-foreground/30';
      default:
        return 'bg-secondary text-foreground';
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const exportLogs = () => {
    const content = filteredLogs
      .map((log) => `[${log.timestamp}] [${log.level}] ${log.message}`)
      .join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs-${new Date().toISOString()}.txt`;
    a.click();
  };

  return (
    <DashboardLayout title="Logs">
      <div className="space-y-4">
        {/* Controls - Responsive Stack */}
        <div className="space-y-3 md:space-y-0">
          {/* First Row: Search and Level Filter */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 md:gap-4">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full text-sm"
              />
            </div>
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="w-full sm:w-[120px] text-sm">
                <SelectValue placeholder="Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="INFO">Info</SelectItem>
                <SelectItem value="WARNING">Warning</SelectItem>
                <SelectItem value="ERROR">Error</SelectItem>
                <SelectItem value="DEBUG">Debug</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Second Row: Auto-scroll, Auto-refresh and Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 md:gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  id="auto-scroll"
                  checked={autoScroll}
                  onCheckedChange={setAutoScroll}
                />
                <Label htmlFor="auto-scroll" className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                  Auto-scroll
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="auto-refresh"
                  checked={autoRefresh}
                  onCheckedChange={setAutoRefresh}
                />
                <Label htmlFor="auto-refresh" className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap flex items-center gap-1">
                  <RefreshCw className={cn("w-3 h-3", autoRefresh && "animate-spin")} style={{ animationDuration: '3s' }} />
                  30s refresh
                </Label>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={fetchLogs} className="gap-2 flex-1 sm:flex-none text-xs sm:text-sm">
                <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
              <Button variant="outline" size="sm" onClick={clearLogs} className="gap-2 flex-1 sm:flex-none text-xs sm:text-sm">
                <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Clear</span>
              </Button>
              <Button variant="outline" size="sm" onClick={exportLogs} className="gap-2 flex-1 sm:flex-none text-xs sm:text-sm">
                <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Export</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Log Viewer */}
        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Application Logs</h3>
            <Badge variant="secondary" className="text-xs">
              {filteredLogs.length} entries
            </Badge>
          </div>

          <ScrollArea className="h-[400px] sm:h-[500px] md:h-[600px] rounded-lg bg-background/50 border border-border" ref={scrollAreaRef}>
            <div className="p-2 sm:p-4 space-y-1 sm:space-y-2 font-mono text-xs sm:text-sm">
              {filteredLogs.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No logs found</p>
              ) : (
                filteredLogs.map((log, index) => (
                  <div
                    key={log.id || index}
                    className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2 p-1.5 sm:p-2 rounded hover:bg-secondary/50 transition-colors animate-fade-in"
                  >
                    <span className="text-xs text-muted-foreground whitespace-nowrap min-w-max">
                      {formatDate(log.timestamp)}
                    </span>
                    <div className="flex items-start gap-1 sm:gap-2 flex-wrap">
                      <Badge
                        variant="outline"
                        className={cn('text-xs', getLevelColor(log.level))}
                      >
                        {log.level}
                      </Badge>
                      <span
                        className={cn(
                          'flex-1 break-words',
                          log.level === 'ERROR' && 'text-destructive',
                          log.level === 'WARNING' && 'text-warning',
                          log.level === 'DEBUG' && 'text-muted-foreground'
                        )}
                      >
                        {log.message}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>

          {!autoScroll && (
            <Button
              variant="outline"
              size="sm"
              className="absolute bottom-8 right-8 gap-2"
              onClick={() => {
                if (scrollAreaRef.current) {
                  const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
                  if (scrollContainer) {
                    scrollContainer.scrollTop = scrollContainer.scrollHeight;
                  }
                }
              }}
            >
              <ArrowDown className="w-4 h-4" />
              Scroll to bottom
            </Button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
