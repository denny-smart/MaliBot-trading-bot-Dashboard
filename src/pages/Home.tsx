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
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 font-sans overflow-x-hidden">

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

          <nav className="hidden md:flex items-center gap-8 font-mono text-xs tracking-widest">
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
            <Link to="/login" className="hidden md:flex relative items-center justify-center px-6 py-2 rounded-full border border-primary/50 text-primary bg-primary/5 overflow-hidden group transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,240,255,0.4)] hover:border-primary">
              <span className="relative z-10 font-mono text-xs font-bold tracking-widest uppercase">
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

            <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
              System Ready. <span className="text-primary">Awaiting Input.</span>
            </h2>

            <p className="text-muted-foreground max-w-xl mb-12">
              The MaliBot protocol is active. Secure your position in the algorithmic future.
            </p>

            <Button className="rounded-none bg-primary hover:bg-primary/90 text-black px-12 py-8 text-lg font-bold tracking-widest shadow-[0_0_30px_rgba(0,240,255,0.4)]" asChild>
              <Link to="/login">
                REQUEST SECURE ACCESS <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>

            <div className="mt-8 flex items-center gap-2 text-primary/60 text-xs font-mono uppercase">
              <CheckCircle2 className="w-3 h-3" /> Encryption Enabled · Admin Approval Required
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-black border-t border-primary/10 py-12 px-6">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center text-muted-foreground text-xs font-mono">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <img src="/favicon.png" alt="MaliBot" className="w-4 h-4 object-contain" />
            <span>MALIBOT // SYSTEM V2.5</span>
          </div>
          <div className="flex gap-8 uppercase tracking-widest">
            <a href="#" className="hover:text-primary transition-colors">Protocol</a>
            <a href="#" className="hover:text-primary transition-colors">Privacy</a>
            <a href="#" className="hover:text-primary transition-colors">Docs</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
