import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Bot, 
  Zap, 
  Shield, 
  TrendingUp, 
  BarChart3, 
  ArrowRight, 
  PlayCircle,
  Settings,
  Activity
} from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: 'Automated Trading',
    description: 'Execute trades automatically 24/7 based on your configured strategies without manual intervention.',
  },
  {
    icon: Shield,
    title: 'Risk Management',
    description: 'Built-in stop-loss, take-profit, and position sizing to protect your capital.',
  },
  {
    icon: BarChart3,
    title: 'Real-time Analysis',
    description: 'Monitor market conditions and get instant insights with live data feeds.',
  },
  {
    icon: TrendingUp,
    title: 'Secure Execution',
    description: 'Enterprise-grade security ensures your trades are executed reliably and safely.',
  },
];

const steps = [
  {
    number: '01',
    icon: Settings,
    title: 'Connect Account',
    description: 'Link your exchange account securely with API keys.',
  },
  {
    number: '02',
    icon: Zap,
    title: 'Configure Strategy',
    description: 'Set your trading parameters, risk limits, and preferences.',
  },
  {
    number: '03',
    icon: Activity,
    title: 'Run & Monitor',
    description: 'Start the bot and track performance in real-time.',
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/20 text-primary">
              <Bot className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold text-foreground">R_25tradingbot</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              How It Works
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link to="/login">Log In</Link>
            </Button>
            <Button asChild>
              <Link to="/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
        <div className="container mx-auto px-4 py-24 md:py-32 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Bot className="w-4 h-4" />
              <span>Automated Trading Platform</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              Automated Trading{' '}
              <span className="text-primary">Made Simple</span>{' '}
              and Smart
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Take control of your trading with intelligent automation. Set your strategy once, 
              and let the bot execute trades around the clock with precision and consistency.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="gap-2 px-8" asChild>
                <Link to="/register">
                  <PlayCircle className="w-5 h-5" />
                  Start Trading
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="gap-2" asChild>
                <Link to="/login">
                  View Dashboard
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-16 md:mt-24 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {[
              { value: '24/7', label: 'Trading Hours' },
              { value: '99.9%', label: 'Uptime' },
              { value: '<50ms', label: 'Execution Speed' },
              { value: '100+', label: 'Strategies' },
            ].map((stat) => (
              <div key={stat.label} className="text-center p-4">
                <div className="text-2xl md:text-3xl font-bold text-primary">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-28 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Powerful Features
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything you need to automate your trading strategy with confidence.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {features.map((feature) => (
              <Card key={feature.title} className="bg-card border-border hover:border-primary/50 transition-colors">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Get started in three simple steps and begin automating your trades today.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {steps.map((step, index) => (
              <div key={step.title} className="relative text-center">
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-px bg-border" />
                )}
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 text-primary mb-6 relative">
                  <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center">
                    {step.number}
                  </span>
                  <step.icon className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28 bg-primary/5">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Ready to Start Trading?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join now and let intelligent automation work for you. No complex setup required.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="gap-2 px-8" asChild>
                <Link to="/register">
                  Create Free Account
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/login">Sign In to Dashboard</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Bot className="w-5 h-5 text-primary" />
            <span className="font-semibold text-foreground">R_25tradingbot</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} R_25tradingbot. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
