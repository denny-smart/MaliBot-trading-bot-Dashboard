import { useEffect, useRef, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { wsService } from "@/services/websocket";
import { api } from "@/services/api";
import { Terminal, XCircle, ArrowDown, Play, Pause } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface LogMessage {
    type: "log";
    level: "INFO" | "WARNING" | "ERROR" | "DEBUG";
    message: string;
    timestamp: number;
    account_id?: string;
}

export function LogTerminal() {
    const [logs, setLogs] = useState<LogMessage[]>([]);
    const [autoScroll, setAutoScroll] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);
    const viewportRef = useRef<HTMLDivElement | null>(null);

    // Parse log string from API into LogMessage format
    const parseLogString = (logString: string): LogMessage | null => {
        // Format: "2026-01-12 14:30:05 | INFO | [user_123] Message content"
        const match = logString.match(/^(.+?)\s*\|\s*([A-Z]+)\s*\|\s*(.+)$/);
        if (match) {
            const [, timestamp, level, message] = match;
            // Clean user tags like [user_123] or [None] from the message
            const cleanMessage = message.replace(/^\[.*?\]\s*/, '').trim();

            // Parse timestamp to Unix timestamp (seconds)
            const date = new Date(timestamp.trim().replace(' ', 'T'));
            const unixTimestamp = date.getTime() / 1000;

            return {
                type: "log",
                level: (level.trim() as "INFO" | "WARNING" | "ERROR" | "DEBUG") || "INFO",
                message: cleanMessage,
                timestamp: unixTimestamp,
            };
        }
        return null;
    };

    // Fetch initial logs on mount
    useEffect(() => {
        const fetchInitialLogs = async () => {
            try {
                const response = await api.monitor.logs();
                const logsData = response.data?.logs || [];
                // Parse string logs into LogMessage objects
                const parsedLogs = logsData
                    .map((log: string) => parseLogString(log))
                    .filter((log): log is LogMessage => log !== null)
                    .slice(-200); // Keep last 200 logs

                setLogs(parsedLogs);
            } catch (error) {
                console.error('Failed to fetch initial logs:', error);
            }
        };

        fetchInitialLogs();
    }, []);

    useEffect(() => {
        const handleLog = (data: any) => {
            if (data && data.message) {
                // Parse the message string from WebSocket
                const parsedLog = parseLogString(data.message);
                if (parsedLog) {
                    setLogs((prev) => {
                        const newLogs = [...prev, parsedLog];
                        // Keep last 200 logs to prevent memory issues
                        return newLogs.slice(-200);
                    });
                }
            }
        };

        wsService.on("log", handleLog);

        return () => {
            wsService.off("log", handleLog);
        };
    }, []);

    useEffect(() => {
        if (autoScroll && viewportRef.current) {
            viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
        }
    }, [logs, autoScroll]);

    const clearLogs = () => setLogs([]);

    // Helper to attach ref to the actual viewport div of ScrollArea
    const setRefs = (node: HTMLDivElement | null) => {
        // @ts-ignore - ScrollArea ref structure assumption, usually works or needs specific tailored access
        if (node) {
            const viewport = node.querySelector('[data-radix-scroll-area-viewport]');
            if (viewport) {
                viewportRef.current = viewport as HTMLDivElement;
            }
        }
    };


    return (
        <Card className="col-span-full border-border/50 bg-background/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Terminal className="h-4 w-4" />
                    Live Terminal
                </CardTitle>
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-foreground"
                        onClick={() => setAutoScroll(!autoScroll)}
                        title={autoScroll ? "Pause Scrolling" : "Resume Scrolling"}
                    >
                        {autoScroll ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-destructive"
                        onClick={clearLogs}
                        title="Clear Logs"
                    >
                        <XCircle className="h-3 w-3" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <ScrollArea
                    className="h-[300px] w-full rounded-md border bg-black/90 p-4 font-mono text-xs"
                    ref={setRefs}
                >
                    {logs.length === 0 ? (
                        <div className="flex h-full items-center justify-center text-muted-foreground/50">
                            Waiting for incoming logs...
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {logs.map((log, i) => (
                                <div key={i} className="flex gap-2 text-primary/90 break-all hover:bg-white/5 p-0.5 rounded transition-colors">
                                    <span className="text-muted-foreground shrink-0 select-none">
                                        {new Date(log.timestamp * 1000).toLocaleTimeString()}
                                    </span>
                                    <span
                                        className={cn(
                                            "shrink-0 font-bold",
                                            log.level === "INFO" && "text-blue-400",
                                            log.level === "WARNING" && "text-yellow-400",
                                            log.level === "ERROR" && "text-red-500",
                                            log.level === "DEBUG" && "text-gray-400"
                                        )}
                                    >
                                        [{log.level}]
                                    </span>
                                    <span className={cn(log.level === 'ERROR' ? "text-red-300" : "text-gray-300")}>
                                        {log.message}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
