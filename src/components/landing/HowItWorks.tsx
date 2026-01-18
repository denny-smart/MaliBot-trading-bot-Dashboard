import { motion } from 'framer-motion';
import { Eye, ShieldCheck, Scale } from 'lucide-react';

const steps = [
    {
        title: "Watch the Market",
        icon: Eye,
        desc: "The bot monitors multiple markets for opportunities, 24/7, so you don't have to.",
        step: "01"
    },
    {
        title: "Check Conditions",
        icon: Scale,
        desc: "It trades only when the setup looks safe and clear. If it's risky, it waits.",
        step: "02"
    },
    {
        title: "Trade & Protect",
        icon: ShieldCheck,
        desc: "One trade at a time with automatic exits. Safety is prioritized over speed.",
        step: "03"
    }
];

export function HowItWorks() {
    return (
        <section id="how-it-works" className="py-24 bg-black relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent opacity-50" />

            <div className="container relative z-10 px-4 md:px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-6">
                        How It Works
                    </h2>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        Simple, safe, and automated.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {steps.map((step, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.2, duration: 0.5 }}
                            viewport={{ once: true }}
                            className="relative group p-8 rounded-2xl bg-card/30 border border-white/5 backdrop-blur-sm hover:border-primary/30 transition-all duration-300"
                        >
                            <div className="absolute -top-6 -left-6 text-6xl font-black text-white/5 font-mono select-none group-hover:text-primary/10 transition-colors">
                                {step.step}
                            </div>

                            <div className="relative mb-6">
                                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20 group-hover:scale-110 transition-transform duration-300 shadow-[0_0_15px_rgba(0,255,157,0.2)]">
                                    <step.icon className="w-8 h-8" />
                                </div>
                            </div>

                            <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">{step.title}</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                {step.desc}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
