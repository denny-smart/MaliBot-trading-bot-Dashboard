import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HeroCommandCenter } from '@/components/landing/HeroCommandCenter';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { RiskProtection } from '@/components/landing/RiskProtection';
import { LiveSystemActivity } from '@/components/landing/LiveSystemActivity';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

export default function Home() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 font-syne overflow-x-hidden">

      {/* Cyber Navbar */}
      <header className={`fixed top-0 z-50 w-full transition-all duration-300 ${scrolled ? 'bg-black/80 backdrop-blur-md border-b border-white/5 py-4' : 'bg-transparent py-6'}`}>
        <div className="container mx-auto flex items-center justify-between px-6">
          <div
            className="flex items-center gap-3 hover:opacity-90 transition-opacity cursor-pointer text-glow"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <img src="/favicon.png" alt="MaliBot" className="w-8 h-8 object-contain" />
            <span className="text-xl font-bold tracking-widest uppercase">
              Mali<span className="text-primary">Bot</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 font-space text-xs tracking-widest">
            {['How It Works', 'Safety', 'Transparency'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(/ /g, '-')}`}
                className="text-muted-foreground hover:text-primary transition-colors uppercase"
              >
                {item}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <Link to="/login" className="hidden md:flex relative items-center justify-center px-6 py-2 rounded-full border border-primary/50 text-primary bg-primary/5 overflow-hidden group transition-all duration-300 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:border-primary">
              <span className="relative z-10 font-space text-xs font-bold tracking-widest uppercase">
                ACCESS DASHBOARD
              </span>

              {/* Surge Effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/40 to-transparent skew-x-12"
                animate={{ left: ["-100%", "200%"] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
            </Link>
          </div>
        </div>
      </header>

      <main>
        <HeroCommandCenter />
        <HowItWorks />
        <RiskProtection />
        <LiveSystemActivity />

        {/* Final Conversion Section */}
        <section className="py-24 relative overflow-hidden bg-black">
          <div className="absolute inset-0 bg-grid-white/5 [mask-image:radial-gradient(ellipse_at_center,black,transparent)]" />
          <div className="container relative z-10 flex flex-col items-center text-center px-4">
            <div className="w-px h-24 bg-gradient-to-b from-transparent via-primary to-transparent mb-8" />

            <h2 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
              System Ready. <span className="text-primary">Awaiting Input.</span>
            </h2>

            <p className="text-xl text-muted-foreground max-w-xl mb-12">
              The MaliBot protocol is active. Secure your position in the algorithmic future.
            </p>

            {/* Refined CTA Button */}
            <div className="relative pt-10 pb-10">
              <div className="relative z-10 inline-block group">
                <Button
                  className="relative rounded-full bg-black/70 backdrop-blur-md text-primary px-7 py-4 md:px-10 md:py-6 text-sm md:text-base font-bold tracking-[0.22em] overflow-hidden border border-primary/40 transition-all duration-500 ease-out hover:-translate-y-0.5 hover:border-primary/60 hover:text-primary hover:bg-black/75"
                  asChild
                >
                  <Link to="/login" className="relative block h-full w-full">
                    <div className="absolute inset-[1px] rounded-full bg-gradient-to-b from-white/[0.04] to-transparent opacity-70" />
                    <div className="absolute inset-y-2 left-8 w-20 rounded-full bg-primary/15 blur-2xl transition-all duration-700 ease-out group-hover:left-1/2 group-hover:-translate-x-1/2 group-hover:bg-primary/20" />
                    <div className="absolute inset-y-0 -left-1/3 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/15 to-transparent opacity-0 transition-all duration-1000 ease-out group-hover:translate-x-[320%] group-hover:opacity-100" />
                    <span className="relative z-20 flex items-center gap-2 drop-shadow-[0_0_12px_rgba(6,182,212,0.65)] whitespace-nowrap">
                      REQUEST SECURE ACCESS <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
                    </span>
                  </Link>
                </Button>

                <div className="absolute inset-0 rounded-full border border-primary/50 shadow-[0_0_22px_rgba(6,182,212,0.24)] group-hover:shadow-[0_0_36px_rgba(6,182,212,0.34)] pointer-events-none transition-all duration-500 ease-out" />
              </div>
            </div>

            <div className="mt-8 flex flex-col md:flex-row items-center justify-center text-center gap-2 text-primary text-sm md:text-base font-space uppercase font-semibold">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Encryption Enabled · Admin Approval Required</span>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-black border-t border-primary/10 py-12 px-6">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center text-muted-foreground text-xs font-space">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <img src="/favicon.png" alt="MaliBot" className="w-4 h-4 object-contain" />
            <span>MALIBOT // SYSTEM V2.5</span>
          </div>
          <div className="flex gap-8 uppercase tracking-widest">

            <Link to="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
            <Link to="/docs" className="hover:text-primary transition-colors">Docs</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
