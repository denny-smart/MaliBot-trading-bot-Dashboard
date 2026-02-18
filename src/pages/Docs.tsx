import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Key, LineChart, PlayCircle, Lock } from 'lucide-react';

export default function Docs() {
    return (
        <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30">
            {/* Header */}
            <header className="fixed top-0 z-50 w-full bg-black/80 backdrop-blur-md border-b border-white/5 py-4">
                <div className="container mx-auto flex items-center justify-between px-6">
                    <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity cursor-pointer">
                        <img src="/favicon.png" alt="MaliBot" className="w-8 h-8 object-contain" />
                        <span className="text-xl font-bold tracking-widest uppercase">
                            Mali<span className="text-primary">Bot</span>
                        </span>
                    </Link>
                    <Link to="/" className="hidden md:flex relative items-center justify-center px-6 py-2 rounded-full border border-primary/50 text-primary bg-primary/5 overflow-hidden group transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,240,255,0.4)] hover:border-primary">
                        <span className="relative z-10 font-mono text-xs font-bold tracking-widest uppercase flex items-center gap-2">
                            <ArrowLeft className="w-4 h-4" /> BACK TO HOME
                        </span>
                        {/* Surge Effect */}
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/40 to-transparent skew-x-12"
                            animate={{ left: ["-100%", "200%"] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        />
                    </Link>
                </div>
            </header>

            <main className="container mx-auto px-6 py-32">
                <div className="max-w-5xl mx-auto">
                    <div className="w-px h-16 bg-gradient-to-b from-transparent via-primary to-transparent mb-8" />
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 uppercase tracking-widest">
                        System <span className="text-primary">Documentation</span>
                    </h1>
                    <p className="text-xl text-muted-foreground mb-16 max-w-2xl">
                        Comprehensive guide for initializing and operating the MaliBot trading system. Follow these procedures to ensure secure and optimal performance.
                    </p>

                    <div className="grid gap-12">

                        {/* Section 1: Access */}
                        <section className="relative pl-8 border-l border-primary/20">
                            <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-background border-2 border-primary" />
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                                <Lock className="w-6 h-6 text-primary" />
                                1. System Access & Security
                            </h2>
                            <div className="prose prose-invert prose-p:text-muted-foreground max-w-none">
                                <p>
                                    Access to the MaliBot system is restricted to authorized personnel.
                                    Authentication is handled securely via <strong>Google Sign-In</strong>.
                                </p>
                                <ul className="list-disc pl-4 space-y-2 mt-4">
                                    <li>Navigate to the <Link to="/login" className="text-primary hover:underline">Login Portal</Link>.</li>
                                    <li>Authenticate using your verified Google credentials.</li>
                                    <li>
                                        <strong>Note:</strong> New accounts require manual approval from a system administrator.
                                        You will be placed in a "Pending Approval" state until verified.
                                    </li>
                                </ul>
                            </div>
                        </section>

                        {/* Section 2: API Configuration */}
                        <section className="relative pl-8 border-l border-primary/20">
                            <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-background border-2 border-primary" />
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                                <Key className="w-6 h-6 text-primary" />
                                2. API Token Configuration
                            </h2>
                            <div className="prose prose-invert prose-p:text-muted-foreground max-w-none">
                                <p>
                                    To execute trades, MaliBot requires a connection to your Deriv account via an API Token.
                                </p>
                                <div className="bg-secondary/30 p-6 rounded-lg my-6 border border-white/5">
                                    <h3 className="text-lg font-semibold text-foreground mb-4">Token Generation Steps:</h3>
                                    <ol className="list-decimal pl-4 space-y-3 text-sm">
                                        <li>Log in to your Deriv account settings.</li>
                                        <li>Navigate to <strong>API Token</strong> management.</li>
                                        <li>Create a new token with the following scopes <strong>ONLY</strong>:
                                            <div className="flex gap-2 mt-2">
                                                <span className="bg-primary/20 text-primary px-2 py-1 rounded text-xs font-mono">Read</span>
                                                <span className="bg-primary/20 text-primary px-2 py-1 rounded text-xs font-mono">Trade</span>
                                            </div>
                                        </li>
                                        <li>Copy the generated token.</li>
                                        <li>In MaliBot, go to <Link to="/settings" className="text-primary hover:underline">Settings</Link> {'>'} <strong>Bot Configuration</strong>.</li>
                                        <li>Paste the token into the "Deriv API Token" field and click <strong>Save Changes</strong>.</li>
                                    </ol>
                                </div>
                            </div>
                        </section>

                        {/* Section 3: Strategy */}
                        <section className="relative pl-8 border-l border-primary/20">
                            <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-background border-2 border-primary" />
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                                <Shield className="w-6 h-6 text-primary" />
                                3. Risk & Strategy Setup
                            </h2>
                            <div className="prose prose-invert prose-p:text-muted-foreground max-w-none">
                                <p>
                                    Configure your trading parameters in the <Link to="/settings" className="text-primary hover:underline">Settings</Link> panel before activation.
                                </p>
                                <div className="grid md:grid-cols-2 gap-6 mt-6">
                                    <div className="bg-white/5 p-4 rounded border border-white/5">
                                        <h4 className="font-semibold text-foreground mb-2">Stake Amount</h4>
                                        <p className="text-sm">
                                            The dollar amount allowed for a single trade.
                                            <br />
                                            <em>Minimum: $10.00</em>
                                        </p>
                                    </div>
                                    <div className="bg-white/5 p-4 rounded border border-white/5">
                                        <h4 className="font-semibold text-foreground mb-2">Active Strategy</h4>
                                        <p className="text-sm">
                                            Select the algorithmic model.
                                            <br />
                                            <strong>Conservative:</strong> Trend-following logic with strict confirmation.
                                            <br />
                                            <strong>Scalping:</strong> High-frequency execution targeting small price movements.
                                            <br />
                                            <strong>Rise/Fall:</strong> Binary options with triple-confirmation signals (EMA + RSI + Stochastic).
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Section 4: Operation */}
                        <section className="relative pl-8 border-l border-primary/20">
                            <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-background border-2 border-primary" />
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                                <PlayCircle className="w-6 h-6 text-primary" />
                                4. Command Center Operations
                            </h2>
                            <div className="prose prose-invert prose-p:text-muted-foreground max-w-none">
                                <p>
                                    The <Link to="/dashboard" className="text-primary hover:underline">Dashboard</Link> is your central control hub.
                                </p>
                                <ul className="list-disc pl-4 space-y-2 mt-4 text-sm md:text-base">
                                    <li>
                                        <strong>Start Bot:</strong> Initiates the analysis loop. The bot will begin scanning for entry signals immediately.
                                    </li>
                                    <li>
                                        <strong>Stop Bot:</strong> Safely halts operations. Open trades will be managed until closure, but no new trades will be taken.
                                    </li>
                                    <li>
                                        <strong>Live Monitoring:</strong> Watch the "Log Terminal" for real-time decision transparency and "Recent Trades" for performance history.
                                    </li>
                                </ul>
                            </div>
                        </section>

                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-black border-t border-primary/10 py-12 px-6 mt-24">
                <div className="container mx-auto flex flex-col md:flex-row justify-between items-center text-muted-foreground text-xs font-mono">
                    <div className="flex items-center gap-2 mb-4 md:mb-0">
                        <img src="/favicon.png" alt="MaliBot" className="w-4 h-4 object-contain" />
                        <span>MALIBOT // SYSTEM V2.5</span>
                    </div>
                    <div className="flex gap-8 uppercase tracking-widest">

                        <Link to="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
                        <Link to="/docs" className="text-primary transition-colors">Docs</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
