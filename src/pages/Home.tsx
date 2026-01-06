import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BloomHero } from '@/components/landing/BloomHero';
import { BloomSection } from '@/components/landing/BloomSection';
import { BloomFeature } from '@/components/landing/BloomFeature';
import {
  Zap,
  Shield,
  TrendingUp,
  BarChart3,
  Activity,
  Globe,
  Lock,
  Bot
} from 'lucide-react';
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
    <div className="min-h-screen bg-bloom-soft selection:bg-bloom-primary/30">
      {/* Navigation - Overlay on Hero */}
      <header className={`fixed top-0 z-50 w-full transition-all duration-300 ${scrolled ? 'bg-bloom-dark/80 backdrop-blur-md py-4' : 'bg-transparent py-6'}`}>
        <div className="container mx-auto flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-bloom-primary to-purple-600 text-white shadow-lg">
              <Bot className="w-6 h-6" />
            </div>
            <span className={`text-xl font-bold tracking-tight ${scrolled ? 'text-white' : 'text-white'}`}>
              Mali<span className="text-bloom-primary">Bot</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            {['Features', 'Monitoring', 'API'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className={`text-sm font-medium hover:text-bloom-primary transition-colors ${scrolled ? 'text-white/80' : 'text-white/80'}`}
              >
                {item}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <Link to="/login" className={`text-sm font-medium hover:text-bloom-primary transition-colors ${scrolled ? 'text-white' : 'text-white'}`}>
              Sign In
            </Link>
            <Button asChild className="rounded-full bg-white text-bloom-dark hover:bg-white/90 font-semibold px-6">
              <Link to="/login">Launch App</Link>
            </Button>
          </div>
        </div>
      </header>

      <BloomHero />

      {/* Intro Section */}
      <BloomSection
        title="What is MaliBot?"
        subtitle="MaliBot is an intelligent automated trading system that helps your capital grow while staying protected against market volatility."
      >
        <div className="mt-12">
          <Button className="rounded-full bg-bloom-dark text-white px-8 py-6 text-lg hover:bg-bloom-dark/90" asChild>
            <Link to="/login">Explore now</Link>
          </Button>
        </div>
      </BloomSection>

      {/* Features Grid - "Capital that grows" style */}
      <BloomSection className="pt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Large Feature 1 */}
          <div className="lg:col-span-2">
            <BloomFeature
              title="Capital that grows"
              description="Earn passive income as your trades are executed by high-performance algorithms."
              variant="light"
              className="h-full bg-gradient-to-br from-purple-100 to-white"
              image="/bloom-hero.png" // Reusing the hero image as a texture
            />
          </div>

          {/* Feature 2 */}
          <BloomFeature
            title="Always liquid, always stable"
            description="Stay fully in control with instant access to your funds - no lockups or delays."
            variant="dark"
            icon={Activity}
          />

          {/* Feature 3 */}
          <BloomFeature
            title="100% hands-free"
            description="No need to manage strategies manually. MaliBot works in the background for you."
            variant="dark"
            icon={Bot}
          />

          {/* Large Feature 4 */}
          <div className="lg:col-span-2 bg-bloom-dark rounded-3xl p-8 relative overflow-hidden group">
            <div className="relative z-10 max-w-xl">
              <h3 className="text-3xl font-bold text-white mb-4">Risk Management First</h3>
              <p className="text-bloom-purple/80 text-lg mb-8">
                Our "Global Position Lock" technology ensures only one active trade across all assets, minimizing exposure and protecting your drawdown.
              </p>
              <div className="flex gap-4">
                <div className="flex items-center gap-2 text-white/80 bg-white/10 px-4 py-2 rounded-full">
                  <Shield className="w-4 h-4 text-bloom-primary" /> Stop Loss
                </div>
                <div className="flex items-center gap-2 text-white/80 bg-white/10 px-4 py-2 rounded-full">
                  <TrendingUp className="w-4 h-4 text-bloom-primary" /> Trailing Stop
                </div>
              </div>
            </div>
            {/* Decorative faint circle */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-64 h-64 bg-bloom-primary/20 rounded-full blur-[80px]" />
          </div>
        </div>
      </BloomSection>

      {/* API & Logging */}
      <BloomSection title="Use cases" dark>
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <h3 className="text-xl font-medium text-bloom-purple mb-4">MaliBot in Action</h3>
            <p className="text-3xl font-bold mb-6 leading-tight">
              Designed for precision<br />
              Built for performance
            </p>
            <p className="text-bloom-purple/70 text-lg mb-8">
              Whether you are a casual trader or a quant developer, MaliBot offers the tools you need.
            </p>
          </div>

          <div className="bg-white/5 rounded-3xl p-8 border border-white/10">
            <h3 className="text-2xl font-bold mb-4">API Integration</h3>
            <p className="text-bloom-purple/70 mb-6">
              Boost user engagement by offering custom integrations via our FastAPI backend.
            </p>
            <img
              src="/bloom-api.png"
              alt="API"
              className="w-full h-48 object-cover rounded-xl opacity-80 mix-blend-overlay"
            />
          </div>
        </div>
      </BloomSection>

      {/* Footer */}
      <footer className="bg-bloom-dark border-t border-white/5 py-12 px-6">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center text-bloom-purple/60 text-sm">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <Bot className="w-5 h-5" />
            <span>MaliBot</span>
          </div>
          <div className="flex gap-8">
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Docs</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
