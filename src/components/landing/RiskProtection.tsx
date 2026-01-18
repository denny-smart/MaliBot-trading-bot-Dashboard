import { motion } from 'framer-motion';
import { Lock, Scan, FastForward, StopCircle, Check } from 'lucide-react';

const features = [
    {
        title: "Safety First — “Global Lock”",
        icon: Lock,
        description: "One trade at a time. No over-trading. This prevents losses from stacking up and protects your balance.",
        quote: "“Focused decisions. Better protection.”"
    },
    {
        title: "Smart Market Checking",
        icon: Scan,
        description: "The bot checks the bigger picture before acting. If the market looks unclear, it waits.",
        quote: "“Trades only when conditions are clear.”"
    },
    {
        title: "Fast Exit Rule (Scalping Mode)",
        icon: FastForward,
        description: "If a trade doesn’t move into profit quickly, the bot closes it early. Small losses stay small.",
        quote: "“No holding bad trades.”"
    },
    {
        title: "Automatic Stop for Bad Days",
        icon: StopCircle,
        description: "Stops trading after a small daily loss. Protects your account on bad market days.",
        quote: "“The bot knows when to stop.”"
    }
];

export function RiskProtection() {
    return (
        <section id="safety" className="py-24 bg-background relative overflow-hidden">
            {/* Cyber Grid Background */}
            <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(to_bottom,transparent,black,transparent)] pointer-events-none" />

            <div className="container relative z-10 px-4 md:px-6">
                <div className="flex flex-col md:flex-row items-start justify-between gap-12 mb-16">
                    <div className="md:w-1/2">
                        <label className="text-primary font-mono text-xs tracking-widest uppercase mb-2 block">
                            Risk Management Protocol
                        </label>
                        <h2 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mb-6 leading-tight">
                            Sleep Easy.<br />
                            <span className="text-primary">Protection Built-In.</span>
                        </h2>
                        <p className="text-muted-foreground text-lg">
                            We removed the fear and doubt. The system is designed to preserve your capital first, and grow it second.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                    {features.map((feature, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1, duration: 0.5 }}
                            viewport={{ once: true }}
                            className="flex gap-6 p-6 rounded-xl bg-secondary/5 border border-white/5 hover:border-primary/20 hover:bg-secondary/10 transition-all duration-300"
                        >
                            <div className="shrink-0 mt-1">
                                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                    <feature.icon className="w-6 h-6" />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                                <p className="text-muted-foreground mb-4 leading-relaxed">
                                    {feature.description}
                                </p>
                                <div className="flex items-center gap-2 text-primary/80 font-medium italic text-sm">
                                    <Check className="w-4 h-4" />
                                    {feature.quote}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
