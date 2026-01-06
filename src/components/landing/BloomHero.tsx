import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function BloomHero() {
    return (
        <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-bloom-dark text-bloom-soft pt-16">
            {/* Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-bloom-primary/20 blur-[100px] rounded-full pointer-events-none" />

            {/* Hero Content */}
            <div className="relative z-10 text-center max-w-4xl mx-auto px-4 animate-fade-in">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-bloom-soft/10 text-bloom-purple text-sm mb-6 border border-bloom-soft/20 backdrop-blur-sm">
                    <span className="w-2 h-2 rounded-full bg-bloom-primary animate-pulse" />
                    <span>Next Gen Trading Logic</span>
                </div>

                <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-br from-white via-bloom-purple to-bloom-primary">
                    Where Money Grows
                </h1>

                <p className="text-lg md:text-xl text-bloom-purple/80 mb-10 max-w-2xl mx-auto leading-relaxed">
                    A programmable, utility-driven trading bot designed for native value accrual and seamless integration into Deriv markets.
                </p>

                <div className="flex items-center justify-center gap-4">
                    <Button
                        size="lg"
                        className="rounded-full bg-bloom-primary hover:bg-bloom-primary/90 text-white px-8 py-6 text-lg shadow-[0_0_20px_rgba(139,92,246,0.5)] hover:shadow-[0_0_30px_rgba(139,92,246,0.6)] transition-all duration-300"
                        asChild
                    >
                        <Link to="/login">
                            Try it now <ArrowRight className="ml-2 w-5 h-5" />
                        </Link>
                    </Button>
                </div>
            </div>

            {/* 3D Visual */}
            <div className="relative w-full max-w-5xl mx-auto mt-[-50px] md:mt-[-100px] z-0 pointer-events-none">
                <div className="aspect-[16/9] w-full relative">
                    <img
                        src="/bloom-hero.png"
                        alt="Bloom Hero"
                        className="w-full h-full object-cover rounded-3xl opacity-90 mask-image-gradient"
                        style={{
                            maskImage: 'linear-gradient(to top, transparent 0%, black 20%, black 80%, transparent 100%)'
                        }}
                    />
                    {/* Overlay gradient to blend bottom */}
                    <div className="absolute inset-0 bg-gradient-to-t from-bloom-dark via-transparent to-transparent" />
                </div>
            </div>

        </div>
    );
}
