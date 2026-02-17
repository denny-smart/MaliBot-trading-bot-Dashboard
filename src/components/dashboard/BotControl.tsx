import { Play, Square, RotateCw, Loader2, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { rotatingRing } from '@/lib/animations';

interface BotControlProps {
  status: 'running' | 'stopped' | 'loading';
  hasApiKey: boolean;
  activeStrategy?: string;
  onStart: () => Promise<void>;
  onStop: () => Promise<void>;
  onRestart: () => Promise<void>;
  onUpdateApiKey: (key: string) => Promise<void>;
}

export function BotControl({ status, hasApiKey, activeStrategy, onStart, onStop, onRestart, onUpdateApiKey }: BotControlProps) {
  const [isLoading, setIsLoading] = useState<'start' | 'stop' | 'restart' | 'apikey' | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogAction, setDialogAction] = useState<'start' | 'stop' | 'restart' | 'apikey' | null>(null);
  const [apiKey, setApiKey] = useState('');

  const handleAction = async () => {
    if (!dialogAction) return;

    setIsLoading(dialogAction);
    try {
      if (dialogAction === 'start') await onStart();
      else if (dialogAction === 'stop') await onStop();
      else if (dialogAction === 'restart') await onRestart();
      else if (dialogAction === 'apikey') await onUpdateApiKey(apiKey);
    } finally {
      setIsLoading(null);
      setDialogOpen(false);
    }
  };

  const openDialog = (action: 'start' | 'stop' | 'restart' | 'apikey') => {
    if ((action === 'start' || action === 'restart') && !hasApiKey) {
      setDialogAction('apikey');
    } else {
      setDialogAction(action);
    }
    setDialogOpen(true);
  };


  const getDialogContent = () => {
    switch (dialogAction) {
      case 'start':
        return {
          title: 'Start Trading Bot?',
          description: 'The bot will start executing trades based on the configured strategy.',
        };
      case 'stop':
        return {
          title: 'Stop Trading Bot?',
          description: 'The bot will stop trading. Any open positions will remain active.',
        };
      case 'restart':
        return {
          title: 'Restart Trading Bot?',
          description: 'The bot will be restarted with the current configuration.',
        };
      case 'apikey':
        return {
          title: 'Configure API Key',
          description: 'Enter your Deriv API Token to enable trading.',
        };
      default:
        return { title: '', description: '' };
    }
  };

  const dialogContent = getDialogContent();

  return (
    <div className="glass-card p-6 rounded-xl">
      <div className="flex flex-col sm:flex-row items-center gap-8">
        {/* Status Indicator - Animated */}
        <div className="relative flex items-center justify-center w-24 h-24">
          {/* Rotating Outer Ring for Active State */}
          {status === 'running' && (
            <motion.div
              className="absolute inset-0 border-2 border-dashed border-success/30 rounded-full"
              variants={rotatingRing}
              animate="animate"
            />
          )}

          {/* Static/Pulse Background */}
          <div
            className={cn(
              'absolute inset-2 rounded-full border-2 transition-all duration-500',
              status === 'running'
                ? 'border-success bg-success/10 shadow-[0_0_20px_rgba(0,255,157,0.2)]'
                : status === 'stopped'
                  ? 'border-destructive bg-destructive/10'
                  : 'border-primary bg-primary/10'
            )}
          />

          {/* Inner Core */}
          <div
            className={cn(
              'w-12 h-12 rounded-full z-10 transition-all duration-300',
              status === 'running' && 'bg-success animate-pulse',
              status === 'stopped' && 'bg-destructive',
              status === 'loading' && 'bg-primary animate-pulse'
            )}
          />
        </div>

        {/* Status Text */}
        <div className="text-center sm:text-left flex-1 space-y-1">
          <p className="text-sm font-mono text-muted-foreground uppercase tracking-wider">System Status</p>
          <p
            className={cn(
              'text-3xl font-bold tracking-tight',
              status === 'running' && 'text-success text-glow-accent',
              status === 'stopped' && 'text-destructive',
              status === 'loading' && 'text-primary'
            )}
          >
            {status === 'running' ? 'OPERATIONAL' : status === 'stopped' ? 'TERMINATED' : 'INITIALIZING...'}
          </p>
          {status === 'running' && activeStrategy && <p className="text-xs text-success/80 font-mono">Running Strategy: {activeStrategy}</p>}
        </div>

        {/* Control Buttons */}
        {/* Control Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={() => openDialog('start')}
            disabled={status === 'running' || isLoading !== null}
            className={cn(
              "control-btn transition-all duration-300",
              status !== 'running'
                ? "bg-success text-success-foreground border-success hover:bg-success hover:shadow-[0_0_20px_rgba(0,255,157,0.4)] shadow-[0_0_15px_rgba(0,255,157,0.3)]"
                : "bg-muted/10 text-muted-foreground border-muted/20 hover:bg-muted/20"
            )}
          >
            {isLoading === 'start' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : !hasApiKey ? (
              <Settings className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">{!hasApiKey ? 'Configure API' : 'Activate'}</span>
          </Button>

          <Button
            onClick={() => openDialog('stop')}
            disabled={status !== 'running' || isLoading !== null}
            className={cn(
              "control-btn transition-all duration-300",
              status === 'running'
                ? "bg-destructive text-destructive-foreground border-destructive hover:bg-destructive hover:shadow-[0_0_20px_rgba(255,0,0,0.4)] shadow-[0_0_15px_rgba(255,0,0,0.3)]"
                : "bg-muted/10 text-muted-foreground border-muted/20 hover:bg-muted/20"
            )}
          >
            {isLoading === 'stop' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Square className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">Terminate</span>
          </Button>

          <Button
            onClick={() => openDialog('restart')}
            disabled={status !== 'running' || isLoading !== null}
            className={cn(
              "control-btn transition-all duration-300",
              status === 'running'
                ? "bg-primary text-primary-foreground border-primary hover:bg-primary hover:shadow-[0_0_20px_rgba(0,123,255,0.4)] shadow-[0_0_15px_rgba(0,123,255,0.3)]"
                : "bg-muted/10 text-muted-foreground border-muted/20 hover:bg-muted/20"
            )}
          >
            {isLoading === 'restart' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RotateCw className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">Reboot</span>
          </Button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="glass-card border-primary/20">
          <DialogHeader>
            <DialogTitle>{dialogContent.title}</DialogTitle>
            <DialogDescription>{dialogContent.description}</DialogDescription>
          </DialogHeader>
          {dialogAction === 'apikey' && (
            <div className="py-4">
              <div className="space-y-2">
                <Label htmlFor="api-key-input">API Token</Label>
                <Input
                  id="api-key-input"
                  type="password"
                  placeholder="Enter Deriv API Token"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="bg-black/50 border-primary/20 focus:border-primary"
                />
                {apiKey.length > 0 && !/^(?=.*[a-zA-Z])(?=.*[0-9])[a-zA-Z0-9]{15,}$/.test(apiKey) && (
                  <p className="text-xs text-destructive mt-1">
                    Token must be at least 15 characters and contain both letters and numbers.
                  </p>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogOpen(false)} className="hover:bg-white/5">
              Cancel
            </Button>
            <Button onClick={handleAction} disabled={isLoading !== null || (dialogAction === 'apikey' && !/^(?=.*[a-zA-Z])(?=.*[0-9])[a-zA-Z0-9]{15,}$/.test(apiKey))} className="bg-primary text-primary-foreground hover:bg-primary/90">
              {isLoading !== null ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'Confirm Protocol'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
