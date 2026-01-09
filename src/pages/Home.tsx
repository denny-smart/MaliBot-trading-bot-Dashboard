import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BloomHero } from '@/components/landing/BloomHero';
import { BloomSection } from '@/components/landing/BloomSection';
import { BloomFeature } from '@/components/landing/BloomFeature';
import {
  Shield,
  TrendingUp,
  BarChart3,
  Activity,
  Lock,
  Bot,
  Settings,
  Target,
  LineChart,
  CheckCircle2,
  ArrowRight
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
    <div className="min-h-screen bg-bloom-dark selection:bg-bloom-primary/30">
      {/* Navigation - Overlay on Hero */}
      <header className={`fixed top-0 z-50 w-full transition-all duration-300 ${scrolled ? 'bg-bloom-dark/80 backdrop-blur-md py-4' : 'bg-transparent py-6'}`}>
        <div className="container mx-auto flex items-center justify-between px-6">
          <div
            className="flex items-center gap-3 hover:opacity-90 transition-opacity cursor-pointer"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-violet-400 to-violet-600 text-white shadow-lg shadow-violet-500/20">
              <Bot className="w-6 h-6" />
            </div>
            <span className={`text-xl font-bold tracking-tight ${scrolled ? 'text-white' : 'text-white'}`}>
              Mali<span className="text-violet-400">Bot</span>
              <span className="block text-[0.6rem] font-medium text-bloom-purple tracking-wider uppercase ml-0.5 -mt-1 opacity-80">Trading Hub</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            {['Features', 'Platform', 'Security'].map((item) => (
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
            <Link to="/login" className="hidden md:flex items-center gap-2 bg-white text-bloom-dark hover:bg-white/90 px-6 py-2.5 rounded-full font-semibold transition-transform hover:-translate-y-0.5 shadow-lg shadow-white/10">
              <span>Sign in with Google</span>
            </Link>
          </div>
        </div>
      </header>

      <BloomHero />

      {/* Platform Badge Section */}
      {/* Platform Badge Section */}
      <section className="py-20 bg-bloom-dark text-center border-b border-white/5 relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="/hero-bg.png"
            alt=""
            className="w-full h-full object-cover object-center opacity-10 mix-blend-luminosity grayscale-[50%]"
          />
          <div className="absolute inset-0 bg-bloom-dark/90" />
        </div>
        <div className="relative z-10">
          <div className="container mx-auto px-4">
            <div className="text-sm font-semibold text-bloom-purple/60 uppercase tracking-widest mb-8">Built For</div>
            <div className="inline-flex items-center gap-3 px-8 py-4 bg-white/5 rounded-2xl border border-violet-500/20 shadow-lg shadow-violet-500/5 mb-10 backdrop-blur-sm">
              <span className="font-bold text-2xl text-white">Deriv</span>
              <span className="font-semibold text-violet-400 text-xl">Volatility Markets</span>
            </div>

            <div className="flex flex-wrap justify-center gap-4 md:gap-8">
              {['🔐 Google OAuth', '⚡ Real-time Data', '📊 Advanced Analytics', '🛡️ Admin Approval'].map((tech) => (
                <div key={tech} className="px-6 py-3 bg-white/5 rounded-xl font-semibold text-bloom-purple/80 hover:bg-white/10 transition-colors border border-white/5">
                  {tech}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <BloomSection title="Complete Trading Platform" subtitle="Everything you need for professional volatility trading in one unified dashboard" className="bg-white/5 border-y border-white/5" withBackground>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="features">
          <BloomFeature
            title="Real-time Bot Monitoring"
            description="Real-time tracking of performance and positions."
            variant="dark"
            icon={Activity}
          />
          <BloomFeature
            title="Trading Dashboard"
            description="Unified view of active trades and orders."
            variant="dark"
            icon={BarChart3}
          />
          <BloomFeature
            title="Trade History & Analytics"
            description="Deep analysis with advanced filtering."
            variant="dark"
            icon={LineChart}
          />
          <BloomFeature
            title="Signal Monitoring"
            description="Visualize entry points and strategy logic."
            variant="dark"
            icon={Target}
          />
          <BloomFeature
            title="Performance Metrics"
            description="Track ROI, win rates, and drawdowns."
            variant="dark"
            icon={TrendingUp}
          />
          <BloomFeature
            title="Strategy Configuration"
            description="Customize strategy and risk settings."
            variant="dark"
            icon={Settings}
          />
        </div>
      </BloomSection>

      {/* Security Section */}
      <BloomSection dark title="Enterprise-Grade Security" subtitle="Your trading data and credentials are protected with bank-level security protocols" className="relative group" id="security" withBackground>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          {[
            { title: 'Google OAuth 2.0', desc: 'Secure passwordless Google login.' },
            { title: 'Admin Approval Workflow', desc: 'Strict admin approval for all users.' },
            { title: 'Role-Based Access', desc: 'Granular admin controls.' },
            { title: 'Protected Routes', desc: 'Secure session handling.' },
          ].map((item, i) => (
            <div key={i} className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition-colors">
              <div className="w-10 h-10 rounded-full bg-bloom-primary/20 flex items-center justify-center text-bloom-primary mb-6">
                <Lock className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">{item.title}</h4>
              <p className="text-bloom-purple/70 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
        {/* Decorative background element */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-bloom-primary/5 rounded-full blur-[120px] pointer-events-none" />
      </BloomSection>

      {/* Supported Indices */}
      <BloomSection title="Supported Volatility Indices" subtitle="Trade across all major Deriv volatility markets" id="platform" withBackground>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white/5 rounded-3xl p-8 border border-white/10 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 backdrop-blur-sm group">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center text-2xl mb-6 border border-blue-500/30">📊</div>
            <h3 className="text-xl font-bold text-white mb-3">V10 & V25 Index</h3>
            <p className="text-bloom-purple/70 leading-relaxed">Low volatility. Ideal for testing strategies.</p>
          </div>
          <div className="bg-bloom-primary/10 rounded-3xl p-8 shadow-xl hover:-translate-y-1 transition-all duration-300 text-white relative overflow-hidden border border-bloom-primary/20">
            <div className="absolute top-0 right-0 p-32 bg-bloom-primary/20 rounded-full blur-3xl -mr-16 -mt-16" />
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-bloom-primary/20 text-bloom-primary flex items-center justify-center text-2xl mb-6">⚡</div>
              <h3 className="text-xl font-bold mb-3">V50 & V75 Index</h3>
              <p className="text-bloom-purple/80 leading-relaxed">Balanced volatility. Best for daily profits.</p>
            </div>
          </div>
          <div className="bg-white/5 rounded-3xl p-8 border border-white/10 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 backdrop-blur-sm group">
            <div className="w-14 h-14 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center text-2xl mb-6 border border-orange-500/30">🚀</div>
            <h3 className="text-xl font-bold text-white mb-3">V100 Index</h3>
            <p className="text-bloom-purple/70 leading-relaxed">High volatility. Maximize profit potential.</p>
          </div>
        </div>
      </BloomSection>

      {/* Final CTA */}
      <section className="py-24 px-4 bg-gradient-to-br from-bloom-dark via-bloom-dark to-bloom-primary/5 relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0 select-none">
          <img
            src="/hero-bg.png"
            alt=""
            className="w-full h-full object-cover object-center opacity-20 mix-blend-overlay grayscale-[20%]"
          />
          <div className="absolute inset-0 bg-bloom-dark/60" />
        </div>
        <div className="container mx-auto max-w-4xl bg-white/5 rounded-[2.5rem] p-8 md:p-16 text-center relative overflow-hidden shadow-2xl border border-white/10 backdrop-blur-md z-10">
          {/* Glows */}
          <div className="absolute top-0 left-0 w-full h-full bg-bloom-primary/5 opacity-50" />
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-bloom-primary/20 rounded-full blur-[80px]" />

          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Ready to Start Trading?</h2>
            <p className="text-bloom-purple/80 text-lg md:text-xl max-w-2xl mx-auto mb-10">
              Join professionals using MaliBot today.
            </p>

            <div className="flex flex-col items-center gap-4">
              <Button className="rounded-full bg-bloom-primary hover:bg-bloom-primary/90 text-white px-10 py-7 text-lg shadow-lg hover:shadow-bloom-primary/25" asChild>
                <Link to="/login">
                  Request Platform Access <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <div className="flex items-center gap-2 text-bloom-purple/60 text-sm font-medium mt-2">
                <CheckCircle2 className="w-4 h-4" /> Admin approval takes 24-48 hours
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-bloom-dark border-t border-white/5 py-12 px-6">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center text-bloom-purple/60 text-sm">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <Bot className="w-5 h-5" />
            <span>MaliBot Trading Hub</span>
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
