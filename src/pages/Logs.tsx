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
import { Search, Download, Trash2, ArrowDown } from 'lucide-react';

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
  const scrollRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  const fetchLogs = async () => {
    try {
      const response = await api.monitor.logs();
      setLogs(response.data?.logs || []);
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    }
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch = log.message.toLowerCase().includes(searchTerm.toLowerCase());
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
        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Log Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="INFO">Info</SelectItem>
                <SelectItem value="WARNING">Warning</SelectItem>
                <SelectItem value="ERROR">Error</SelectItem>
                <SelectItem value="DEBUG">Debug</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <Switch
                id="auto-scroll"
                checked={autoScroll}
                onCheckedChange={setAutoScroll}
              />
              <Label htmlFor="auto-scroll" className="text-sm text-muted-foreground">
                Auto-scroll
              </Label>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={clearLogs} className="gap-2">
              <Trash2 className="w-4 h-4" />
              Clear
            </Button>
            <Button variant="outline" size="sm" onClick={exportLogs} className="gap-2">
              <Download className="w-4 h-4" />
              Export
            </Button>
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

          <ScrollArea className="h-[600px] rounded-lg bg-background/50 border border-border" ref={scrollRef}>
            <div className="p-4 space-y-2 font-mono text-sm">
              {filteredLogs.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No logs found</p>
              ) : (
                filteredLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start gap-3 p-2 rounded hover:bg-secondary/50 transition-colors animate-fade-in"
                  >
                    <span className="text-xs text-muted-foreground whitespace-nowrap min-w-[140px]">
                      {formatDate(log.timestamp)}
                    </span>
                    <Badge
                      variant="outline"
                      className={cn('text-xs min-w-[70px] justify-center', getLevelColor(log.level))}
                    >
                      {log.level}
                    </Badge>
                    <span
                      className={cn(
                        'flex-1',
                        log.level === 'ERROR' && 'text-destructive',
                        log.level === 'WARNING' && 'text-warning',
                        log.level === 'DEBUG' && 'text-muted-foreground'
                      )}
                    >
                      {log.message}
                    </span>
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
                if (scrollRef.current) {
                  scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
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
