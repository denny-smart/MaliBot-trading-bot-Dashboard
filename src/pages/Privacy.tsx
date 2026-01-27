import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Lock, Scale, Database } from 'lucide-react';

export default function Privacy() {
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
                <div className="max-w-4xl mx-auto">
                    <div className="w-px h-16 bg-gradient-to-b from-transparent via-primary to-transparent mb-8" />
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 uppercase tracking-widest">
                        Privacy <span className="text-primary">Policy</span>
                    </h1>
                    <p className="text-xl text-muted-foreground mb-16 max-w-2xl">
                        We believe in keeping things simple. We protect your data, respect your ownership, and ensure everything remains secure.
                    </p>

                    <div className="grid gap-12">

                        {/* Section 1: Data Collection */}
                        <section className="relative pl-8 border-l border-primary/20">
                            <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-background border-2 border-primary" />
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                                <Database className="w-6 h-6 text-primary" />
                                1. What We Collect
                            </h2>
                            <div className="prose prose-invert prose-p:text-muted-foreground max-w-none">
                                <p>
                                    We rely on a "Need-to-Know" rule. We only collect the bare minimum needed for the bot to trade for you.
                                </p>
                                <ul className="list-disc pl-4 space-y-2 mt-4">
                                    <li><strong>What we keep:</strong> Your encrypted API keys, strategy settings, and a log of your trades.</li>
                                    <li><strong>What we NEVER touch:</strong> Your banking details, government IDs, or any personal files.</li>
                                </ul>
                            </div>
                        </section>

                        {/* Section 2: Security & Encryption */}
                        <section className="relative pl-8 border-l border-primary/20">
                            <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-background border-2 border-primary" />
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                                <Lock className="w-6 h-6 text-primary" />
                                2. How We Protect You
                            </h2>
                            <div className="prose prose-invert prose-p:text-muted-foreground max-w-none">
                                <p>
                                    Your secrets stay secret. We use the highest standard of encryption (AES-256) to lock your API tokens.
                                </p>
                                <div className="bg-secondary/30 p-6 rounded-lg my-6 border border-white/5">
                                    <h3 className="text-lg font-semibold text-foreground mb-2">Total Isolation</h3>
                                    <p className="text-sm">
                                        Your bot runs in its own private box. It is completely separated from other users, so your data can never mix with anyone else's.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Section 3: Trust & Ownership */}
                        <section className="relative pl-8 border-l border-primary/20">
                            <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-background border-2 border-primary" />
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                                <Shield className="w-6 h-6 text-primary" />
                                3. Your Data Rights
                            </h2>
                            <div className="prose prose-invert prose-p:text-muted-foreground max-w-none">
                                <p>
                                    <strong>It's your data, not ours.</strong> We do not sell, rent, or trade your information to anyone—ever.
                                </p>
                                <p className="mt-4">
                                    You have the "Right to Delete." If you close your account, we wipe all your records from our systems within 24 hours.
                                </p>
                            </div>
                        </section>

                        {/* Section 4: Legal Recourse */}
                        <section className="relative pl-8 border-l border-primary/20">
                            <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-background border-2 border-primary" />
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                                <Scale className="w-6 h-6 text-primary" />
                                4. Our Promise to You
                            </h2>
                            <div className="prose prose-invert prose-p:text-muted-foreground max-w-none">
                                <p>
                                    We stand by our security. If anything goes wrong, we have clear rules to protect you.
                                </p>
                                <ul className="list-disc pl-4 space-y-2 mt-4 text-sm md:text-base">
                                    <li>
                                        <strong>We'll Tell You First:</strong> If there is ever a security issue, we will notify you within <strong>72 hours</strong>.
                                    </li>
                                    <li>
                                        <strong>We Take Responsibility:</strong> If a loss happens because of a mistake in our security, we accept responsibility as outlined in our terms.
                                    </li>
                                    <li>
                                        <strong>Your Rights:</strong> You always have the right to take legal action if we fail to keep these promises.
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

                        <Link to="/privacy" className="text-primary transition-colors">Privacy</Link>
                        <Link to="/docs" className="hover:text-primary transition-colors">Docs</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
