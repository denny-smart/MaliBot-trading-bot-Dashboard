import { ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

export function BloomHero() {
    return (
        <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-bloom-dark text-bloom-soft pt-24 pb-12">
            {/* Background Glow */}
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <img
                    src="/hero-bg.png"
                    alt="Blooming flowers and coins"
                    className="w-full h-full object-cover object-center opacity-40 mix-blend-luminosity hover:mix-blend-normal transition-all duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-bloom-dark via-bloom-dark/80 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-bloom-dark via-transparent to-bloom-dark" />
            </div>

            {/* Hero Content */}
            <div className="relative z-10 text-center max-w-4xl mx-auto px-4 animate-fade-in">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-bloom-soft/10 text-white text-sm mb-6 border border-bloom-soft/20 backdrop-blur-sm">
                    <span className="w-2 h-2 rounded-full bg-bloom-primary animate-pulse" />
                    <span>Next Gen Trading Logic</span>
                </div>

                <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 text-white leading-[1.1]">
                    Where Money <span className="text-bloom-primary">Grows</span>
                </h1>

                <p className="text-lg md:text-xl text-bloom-purple/80 mb-10 max-w-xl mx-auto leading-relaxed">
                    Professional trading hub for Deriv Volatility Markets. Real-time monitoring, advanced analytics, and automated trading powered by Top Down market analysis.
                </p>

                <div className="flex flex-wrap items-center justify-center gap-4">

                    <Button
                        size="lg"
                        className="rounded-full bg-bloom-primary hover:bg-bloom-primary/90 text-white px-8 py-6 text-lg shadow-lg hover:shadow-bloom-primary/25 transition-all duration-300"
                        asChild
                    >
                        <Link to="/login">
                            Get Started <ArrowRight className="ml-2 w-5 h-5" />
                        </Link>
                    </Button>

                    <Dialog>
                        <DialogTrigger asChild>
                            <Button
                                size="lg"
                                variant="outline"
                                className="rounded-full border-2 border-white/20 hover:bg-white/10 text-white px-8 py-6 text-lg hover:border-white/40 transition-all duration-300 bg-transparent"
                            >
                                <Play className="mr-2 w-5 h-5 fill-current" /> Watch Demo
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[800px] p-0 bg-black/90 border-white/10 overflow-hidden">
                            <div className="aspect-video w-full">
                                <iframe
                                    width="100%"
                                    height="100%"
                                    src="https://www.youtube.com/embed/-lZ-du4u_tQ?autoplay=1"
                                    title="MaliBot Demo"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    className="w-full h-full"
                                ></iframe>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* 3D Visual - Dashboard Preview */}
            <div className="relative w-full h-[450px] flex items-center justify-center perspective-1000 mt-12">
                {/* Background Gradient for visual area */}
                <div className="absolute inset-0 bg-gradient-to-br from-bloom-dark/50 to-bloom-primary/5 rounded-[30px] -z-10 blur-xl" />

                <div className="w-[90%] max-w-[600px] bg-bloom-dark/40 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden animate-float transform rotate-x-6 border border-white/10">
                    {/* Header */}
                    <div className="bg-white/5 p-4 border-b border-white/10 flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-400" />
                        <div className="w-3 h-3 rounded-full bg-amber-400" />
                        <div className="w-3 h-3 rounded-full bg-green-400" />
                    </div>

                    {/* Content */}
                    <div className="p-6 bg-transparent">
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-gradient-to-br from-bloom-primary to-violet-600 p-4 rounded-xl text-white shadow-lg">
                                <div className="text-xs opacity-80 font-medium mb-1">TOTAL PROFIT</div>
                                <div className="text-2xl font-bold">$12,845</div>
                            </div>
                            <div className="bg-gradient-to-br from-bloom-primary to-violet-600 p-4 rounded-xl text-white shadow-lg">
                                <div className="text-xs opacity-80 font-medium mb-1">WIN RATE</div>
                                <div className="text-2xl font-bold">78.5%</div>
                            </div>
                            <div className="bg-gradient-to-br from-bloom-primary to-violet-600 p-4 rounded-xl text-white shadow-lg">
                                <div className="text-xs opacity-80 font-medium mb-1">ACTIVE TRADES</div>
                                <div className="text-2xl font-bold">5</div>
                            </div>
                            <div className="bg-gradient-to-br from-bloom-primary to-violet-600 p-4 rounded-xl text-white shadow-lg">
                                <div className="text-xs opacity-80 font-medium mb-1">ROI</div>
                                <div className="text-2xl font-bold">+42.3%</div>
                            </div>
                        </div>

                        {/* Chart Area */}
                        <div className="h-32 bg-gradient-to-b from-bloom-primary/10 to-transparent rounded-lg relative overflow-hidden flex items-end">
                            {/* Simplified Chart Lines */}
                            <div className="w-full h-full relative">
                                <svg viewBox="0 0 100 40" className="w-full h-full absolute bottom-0 left-0 text-bloom-primary overflow-visible" preserveAspectRatio="none">
                                    <path d="M0 40 L0 30 L10 25 L20 32 L30 20 L40 25 L50 15 L60 18 L70 10 L80 15 L90 5 L100 10 L100 40 Z" fill="currentColor" fillOpacity="0.2" />
                                    <path d="M0 30 L10 25 L20 32 L30 20 L40 25 L50 15 L60 18 L70 10 L80 15 L90 5 L100 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}
