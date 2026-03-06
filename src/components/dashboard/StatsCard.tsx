import { ArrowDown, ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';
import { motion, useSpring, useTransform, useMotionValue } from 'framer-motion';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: string | number;
  trend?: 'up' | 'down' | 'neutral' | { value: number; label: string };
  variant?: 'success' | 'danger' | 'default';
  pulse?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
}

// Animated Counter Component
function AnimatedCounter({ value }: { value: number }) {
  const spring = useSpring(0, { mass: 0.8, stiffness: 75, damping: 15 });
  const display = useTransform(spring, (current) =>
    // Format based on magnitude (simple heuristic)
    current.toLocaleString('en-US', {
      minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
      maximumFractionDigits: 2
    })
  );

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return <motion.span>{display}</motion.span>;
}

export function StatsCard({
  title,
  value,
  subtitle,
  change,
  trend = 'neutral',
  variant = 'default',
  pulse = false,
  icon: IconComponent,
  className
}: StatsCardProps) {
  // Determine if value is numeric for animation
  const numericValue = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]+/g, "")) : value;
  const isNumeric = !isNaN(numericValue);

  // Extract prefix/suffix if string
  const prefix = typeof value === 'string' && value.includes('$') ? '$' : '';
  const suffix = typeof value === 'string' && value.includes('%') ? '%' : '';

  // Handle trend being an object or string
  const trendDirection = typeof trend === 'object'
    ? (trend.value > 0 ? 'up' : trend.value < 0 ? 'down' : 'neutral')
    : trend;
  const trendValue = typeof trend === 'object' ? trend.value : null;
  const trendLabel = typeof trend === 'object' ? trend.label : null;

  // Get variant color classes
  const variantClasses = {
    success: 'border-success/20 bg-success/5',
    danger: 'border-destructive/20 bg-destructive/5',
    default: ''
  }[variant];

  return (
    <motion.div
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className={cn("bg-zinc-900 border-zinc-800 p-6 rounded-2xl flex flex-col justify-between h-full group border", variantClasses, className)}
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider group-hover:text-zinc-300 transition-colors">{title}</h3>
        {IconComponent && (
          <div className={cn(
            "p-2 rounded-xl bg-zinc-800/50 text-zinc-400 group-hover:text-zinc-200 transition-colors relative",
            pulse && variant === 'success' && "animate-pulse"
          )}>
            <IconComponent className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="space-y-1 mt-auto">
        <div className="text-3xl font-bold tracking-tight text-white flex items-baseline">
          {prefix}
          {isNumeric ? (
            <AnimatedCounter value={numericValue} />
          ) : (
            value
          )}
          {suffix}
        </div>

        {subtitle && (
          <div className="text-xs text-muted-foreground">
            {subtitle}
          </div>
        )}

        {(change || trendValue !== null) && (
          <div className={cn(
            "flex items-center text-xs font-medium",
            trendDirection === 'up' && "text-success",
            trendDirection === 'down' && "text-destructive",
            trendDirection === 'neutral' && "text-muted-foreground"
          )}>
            {trendDirection === 'up' && <ArrowUp className="w-3 h-3 mr-1" />}
            {trendDirection === 'down' && <ArrowDown className="w-3 h-3 mr-1" />}
            {change || (trendValue !== null && `${trendValue > 0 ? '+' : ''}${trendValue.toFixed(1)}%`)}
            {trendLabel && <span className="ml-1 text-muted-foreground opacity-60">{trendLabel}</span>}
            {change && !trendLabel && <span className="ml-1 text-muted-foreground opacity-60">vs last period</span>}
          </div>
        )}
      </div>
    </motion.div>
  );
}
