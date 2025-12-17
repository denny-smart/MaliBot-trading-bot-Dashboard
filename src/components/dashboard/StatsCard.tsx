import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
  };
  variant?: 'default' | 'success' | 'danger';
  pulse?: boolean;
}

export function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'default',
  pulse = false,
}: StatsCardProps) {
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="flex items-center gap-2 mt-2">
            {pulse && (
              <span
                className={cn(
                  'status-indicator',
                  variant === 'success' && 'status-running',
                  variant === 'danger' && 'status-stopped'
                )}
              />
            )}
            <p
              className={cn(
                'text-2xl font-bold',
                variant === 'success' && 'text-success',
                variant === 'danger' && 'text-destructive',
                variant === 'default' && 'text-foreground'
              )}
            >
              {value}
            </p>
          </div>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          )}
          {trend && (
            <p
              className={cn(
                'text-xs mt-2 font-medium',
                trend.value >= 0 ? 'text-success' : 'text-destructive'
              )}
            >
              {trend.value >= 0 ? '+' : ''}
              {trend.value}% {trend.label}
            </p>
          )}
        </div>
        <div
          className={cn(
            'p-2.5 rounded-lg',
            variant === 'success' && 'bg-success/20 text-success',
            variant === 'danger' && 'bg-destructive/20 text-destructive',
            variant === 'default' && 'bg-primary/20 text-primary'
          )}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
