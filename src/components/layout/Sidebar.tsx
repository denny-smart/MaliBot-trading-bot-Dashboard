import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Activity,
  TrendingUp,
  Settings,
  FileText,
  ChevronLeft,
  ChevronRight,
  Bot,
  Users
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/contexts/AuthContext';

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/trades', icon: Activity, label: 'Trades' },
  { path: '/monitoring', icon: TrendingUp, label: 'Monitoring' },
  { path: '/logs', icon: FileText, label: 'Logs' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

const adminNavItems = [
  { path: '/users', icon: Users, label: 'Users', adminOnly: true },
];

export function Sidebar() {
  const location = useLocation();
  const isMobile = useIsMobile();
  const { role } = useAuth();
  const [collapsed, setCollapsed] = useState(isMobile);

  // Combine nav items, including admin-only items if user is admin
  const allNavItems = role === 'admin'
    ? [...navItems, ...adminNavItems]
    : navItems;

  return (
    <aside
      className={cn(
        'h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        {/* Logo */}
        <div
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center gap-3 px-4 py-6 border-b border-sidebar-border hover:bg-sidebar-accent/50 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/20 text-primary">
            <Bot className="w-6 h-6" />
          </div>
          {!collapsed && (
            <div className="animate-fade-in text-left">
              <h1 className="text-lg font-bold text-foreground">MaliBot</h1>
              <p className="text-xs text-muted-foreground">Trading Dashboard</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {allNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                  isActive
                    ? 'bg-primary/20 text-primary border border-primary/30'
                    : 'text-muted-foreground hover:bg-sidebar-accent hover:text-foreground'
                )}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && (
                  <span className="font-medium animate-fade-in">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Collapse Button */}
        <div className="p-3 border-t border-sidebar-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="w-full justify-center text-muted-foreground hover:text-foreground"
          >
            {collapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <>
                <ChevronLeft className="w-5 h-5 mr-2" />
                <span>Collapse</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </aside>
  );
}
