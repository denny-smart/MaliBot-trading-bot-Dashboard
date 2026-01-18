import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal } from 'lucide-react';

const logMessages = [
    { type: 'info', text: 'Connecting to market data feed...', delay: 1000 },
    { type: 'success', text: 'Market checked — Volatility Indices OK', delay: 2500 },
    { type: 'warning', text: 'Conditions not clear — no trade', delay: 4500 },
    { type: 'wait', text: 'Waiting for confirmed setup...', delay: 7000 },
    { type: 'info', text: 'Analyzing momentum indicators...', delay: 10000 },
    { type: 'warning', text: 'Trend unclear, skipping entry', delay: 13000 },
    { type: 'info', text: 'Safety limit active — protecting capital', delay: 16000 },
    { type: 'success', text: 'Setup confirmed — Awaiting entry trigger', delay: 19000 },
];

export function LiveSystemActivity() {
    const [currentLogs, setCurrentLogs] = useState<any[]>([]);

    useEffect(() => {
        let timeouts: NodeJS.Timeout[] = [];

        const runSimulation = () => {
            setCurrentLogs([]); // Clear logs on restart
            logMessages.forEach((msg) => {
                const timeout = setTimeout(() => {
                    setCurrentLogs(prev => [...prev.slice(-4), msg]); // Keep last 5 logs
                }, msg.delay);
                timeouts.push(timeout);
            });
        };

        runSimulation();
        const loop = setInterval(runSimulation, 22000); // Restart loop

        return () => {
            timeouts.forEach(clearTimeout);
            clearInterval(loop);
        };
    }, []);

    return (
        <section id="transparency" className="py-24 bg-black border-t border-white/5">
            <div className="container px-4 text-center max-w-4xl mx-auto">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-mono mb-8">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    LIVE SYSTEM LOGS
                </div>

                <h2 className="text-3xl md:text-4xl font-bold mb-12">
                    Transparency is Key.
                    <br />
                    <span className="text-muted-foreground text-xl md:text-2xl font-normal mt-2 block">
                        “The system does not trade all the time. It waits for the right moment.”
                    </span>
                </h2>

                <div className="w-full bg-slate-950 rounded-xl border border-white/10 p-6 text-left font-mono text-sm shadow-2xl relative overflow-hidden">
                    {/* Terminal Header */}
                    <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-4">
                        <Terminal className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">malibot_core.log</span>
                    </div>

                    <div className="space-y-3 min-h-[200px]">
                        <AnimatePresence mode="popLayout">
                            {currentLogs.map((log, index) => (
                                <motion.div
                                    key={`${index}-${log.text}`}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="flex items-start gap-3"
                                >
                                    <span className="text-white/30 text-xs mt-0.5">
                                        {new Date().toLocaleTimeString()}
                                    </span>
                                    <span className={`
                                        ${log.type === 'success' ? 'text-green-400' : ''}
                                        ${log.type === 'warning' ? 'text-amber-400' : ''}
                                        ${log.type === 'info' ? 'text-blue-400' : ''}
                                        ${log.type === 'wait' ? 'text-white/60' : ''}
                                    `}>
                                        {log.type === 'warning' ? '[SKIP] ' : ''}
                                        {log.type === 'success' ? '[OK] ' : ''}
                                        {log.type === 'wait' ? '[WAIT] ' : ''}
                                        {log.text}
                                    </span>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        {currentLogs.length === 0 && (
                            <div className="text-white/20 italic">Initializing system monitor...</div>
                        )}
                        <motion.div
                            className="w-2 h-4 bg-primary/50"
                            animate={{ opacity: [0, 1, 0] }}
                            transition={{ duration: 0.8, repeat: Infinity }}
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
