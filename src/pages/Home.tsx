import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Bot, 
  Zap, 
  Shield, 
  TrendingUp, 
  BarChart3, 
  ArrowRight, 
  Activity,
  Clock,
  LineChart,
  AlertTriangle,
  Globe,
  Radio,
  Lock,
  Bell,
  FileText,
  PieChart,
  History,
  Target,
  ScrollText
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

// Animation hook for scroll reveal
function useScrollReveal() {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return { ref, isVisible };
}

// Animated Section Component
function AnimatedSection({ 
  children, 
  className = '',
  delay = 0 
}: { 
  children: React.ReactNode; 
  className?: string;
  delay?: number;
}) {
  const { ref, isVisible } = useScrollReveal();
  
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${className}`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
        transitionDelay: `${delay}ms`
      }}
    >
      {children}
    </div>
  );
}

// Feature Card Component
function FeatureCard({ 
  icon: Icon, 
  title, 
  description, 
  delay = 0 
}: { 
  icon: React.ElementType; 
  title: string; 
  description: string;
  delay?: number;
}) {
  const { ref, isVisible } = useScrollReveal();
  
  return (
    <div
      ref={ref}
      className="group"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
        transition: `all 0.5s ease-out ${delay}ms`
      }}
    >
      <Card className="h-full bg-card/50 border-border/50 hover:border-primary/50 hover:bg-card/80 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
        <CardContent className="p-6">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
            <Icon className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
        </CardContent>
      </Card>
    </div>
  );
}

const coreFeatures = [
  {
    icon: Zap,
    title: 'Automated Trading',
    description: 'Execute trades automatically based on technical analysis signals without manual intervention.',
  },
  {
    icon: Clock,
    title: 'Multi-Timeframe Analysis',
    description: 'Analyze 1-minute and 5-minute charts simultaneously for precise entry and exit signals.',
  },
  {
    icon: LineChart,
    title: 'Technical Indicators',
    description: 'RSI, ADX, ATR, MACD, and Bollinger Bands working together for accurate predictions.',
  },
  {
    icon: Shield,
    title: 'Risk Management',
    description: 'Built-in stop loss, take profit, and trailing stop to protect your capital.',
  },
  {
    icon: AlertTriangle,
    title: 'Anti-Reversal Protection',
    description: 'Smart detection to avoid volatile market conditions and sudden reversals.',
  },
  {
    icon: TrendingUp,
    title: 'Trend Following',
    description: 'Identify and ride market trends with intelligent position management.',
  },
];

const apiFeatures = [
  {
    icon: Globe,
    title: 'FastAPI Backend',
    description: 'High-performance Python backend built with FastAPI for lightning-fast API responses.',
  },
  {
    icon: Radio,
    title: 'WebSocket API',
    description: 'Real-time streaming updates for trades, signals, and market data.',
  },
  {
    icon: Lock,
    title: 'JWT Authentication',
    description: 'Secure token-based authentication for protected access.',
  },
  {
    icon: Bell,
    title: 'Telegram Notifications',
    description: 'Instant trade alerts and status updates via Telegram.',
  },
  {
    icon: FileText,
    title: 'Interactive API Docs',
    description: 'Swagger and ReDoc documentation for easy integration.',
  },
];

const monitoringFeatures = [
  {
    icon: PieChart,
    title: 'Live Performance',
    description: 'Real-time metrics including win rate, P&L, and trade statistics.',
  },
  {
    icon: History,
    title: 'Trade History',
    description: 'Complete historical record of all executed trades and outcomes.',
  },
  {
    icon: Target,
    title: 'Signal Tracking',
    description: 'Monitor buy/sell signals and their accuracy over time.',
  },
  {
    icon: ScrollText,
    title: 'Real-time Logs',
    description: 'Live system logs for transparency and debugging.',
  },
];

export default function Home() {
  const [heroVisible, setHeroVisible] = useState(false);
  const { signInWithGoogle } = useAuth();

  useEffect(() => {
    setHeroVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/20 text-primary">
              <Bot className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold text-foreground">R_25tradingbot</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Features
            </a>
            <a href="#api" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              API
            </a>
            <a href="#monitoring" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Monitoring
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild className="hover:text-primary">
              <Link to="/login">Sign In</Link>
            </Button>
            <Button className="shadow-lg shadow-primary/25" onClick={signInWithGoogle}>
              Sign Up
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        
        {/* Floating elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

        <div className="container mx-auto px-4 py-24 md:py-32 lg:py-40 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div 
              className="transition-all duration-1000 ease-out"
              style={{
                opacity: heroVisible ? 1 : 0,
                transform: heroVisible ? 'translateY(0)' : 'translateY(30px)'
              }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8">
                <Activity className="w-4 h-4 animate-pulse" />
                <span>Intelligent Automated Trading</span>
              </div>
            </div>

            <h1 
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight transition-all duration-1000 ease-out"
              style={{
                opacity: heroVisible ? 1 : 0,
                transform: heroVisible ? 'translateY(0)' : 'translateY(30px)',
                transitionDelay: '100ms'
              }}
            >
              Smart Trading Bot for{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">
                Precision Trading
              </span>
            </h1>

            <p 
              className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed transition-all duration-1000 ease-out"
              style={{
                opacity: heroVisible ? 1 : 0,
                transform: heroVisible ? 'translateY(0)' : 'translateY(30px)',
                transitionDelay: '200ms'
              }}
            >
              A high-performance automated trading bot powered by FastAPI. Analyzes markets in real time, 
              manages risk with precision, and executes trades based on advanced technical indicators.
            </p>

            <div 
              className="flex flex-col sm:flex-row items-center justify-center gap-4 transition-all duration-1000 ease-out"
              style={{
                opacity: heroVisible ? 1 : 0,
                transform: heroVisible ? 'translateY(0)' : 'translateY(30px)',
                transitionDelay: '300ms'
              }}
            >
              <Button size="lg" className="gap-2 px-8 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-shadow" onClick={signInWithGoogle}>
                Sign Up
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button size="lg" variant="outline" className="gap-2 border-border/50 hover:border-primary/50 hover:bg-primary/5" asChild>
                <Link to="/login">
                  Sign In
                </Link>
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div 
            className="mt-20 md:mt-28 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto transition-all duration-1000 ease-out"
            style={{
              opacity: heroVisible ? 1 : 0,
              transform: heroVisible ? 'translateY(0)' : 'translateY(30px)',
              transitionDelay: '400ms'
            }}
          >
            {[
              { value: '24/7', label: 'Automated Trading' },
              { value: '5+', label: 'Technical Indicators' },
              { value: '<50ms', label: 'Execution Speed' },
              { value: 'Real-time', label: 'Market Analysis' },
            ].map((stat, index) => (
              <div 
                key={stat.label} 
                className="text-center p-6 rounded-xl bg-card/30 border border-border/30 backdrop-blur-sm hover:border-primary/30 transition-colors"
              >
                <div className="text-2xl md:text-3xl font-bold text-primary mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Trading Features */}
      <section id="features" className="py-24 md:py-32 bg-muted/20">
        <div className="container mx-auto px-4">
          <AnimatedSection className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <BarChart3 className="w-4 h-4" />
              <span>Core Features</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Powerful Trading Capabilities
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Advanced technical analysis and risk management features for consistent trading performance.
            </p>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {coreFeatures.map((feature, index) => (
              <FeatureCard key={feature.title} {...feature} delay={index * 100} />
            ))}
          </div>
        </div>
      </section>

      {/* API & Integration */}
      <section id="api" className="py-24 md:py-32">
        <div className="container mx-auto px-4">
          <AnimatedSection className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Globe className="w-4 h-4" />
              <span>API & Integration</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Seamless Integration
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Full API access with real-time updates and secure authentication.
            </p>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {apiFeatures.map((feature, index) => (
              <FeatureCard key={feature.title} {...feature} delay={index * 100} />
            ))}
          </div>
        </div>
      </section>

      {/* Monitoring & Analytics */}
      <section id="monitoring" className="py-24 md:py-32 bg-muted/20">
        <div className="container mx-auto px-4">
          <AnimatedSection className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Activity className="w-4 h-4" />
              <span>Monitoring</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Real-time Analytics
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Track performance, analyze trades, and monitor signals in real time.
            </p>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {monitoringFeatures.map((feature, index) => (
              <FeatureCard key={feature.title} {...feature} delay={index * 100} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-primary/5 via-transparent to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
        
        <AnimatedSection className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Start Trading Smarter Today
            </h2>
            <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
              Join now and let intelligent automation analyze markets and execute trades for you.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="gap-2 px-10 shadow-lg shadow-primary/25" onClick={signInWithGoogle}>
                Sign Up Now
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button size="lg" variant="outline" className="border-border/50 hover:border-primary/50" asChild>
                <Link to="/login">Sign In</Link>
              </Button>
            </div>
          </div>
        </AnimatedSection>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12 bg-muted/10">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Bot className="w-5 h-5 text-primary" />
            <span className="font-semibold text-foreground">R_25tradingbot</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} R_25tradingbot. Automated trading with precision.
          </p>
        </div>
      </footer>
    </div>
  );
}
