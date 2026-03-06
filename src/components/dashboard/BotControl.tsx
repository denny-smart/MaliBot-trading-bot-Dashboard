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
  autoExecuteSignals: boolean;
  onStart: () => Promise<void>;
  onStop: () => Promise<void>;
  onRestart: () => Promise<void>;
  onToggleAutoExecuteSignals: (enabled: boolean) => Promise<void>;
  onUpdateApiKey: (key: string) => Promise<void>;
}

export function BotControl({
  status,
  hasApiKey,
  activeStrategy,
  autoExecuteSignals,
  onStart,
  onStop,
  onRestart,
  onToggleAutoExecuteSignals,
  onUpdateApiKey,
}: BotControlProps) {
  const [isLoading, setIsLoading] = useState<'start' | 'stop' | 'restart' | 'apikey' | 'autoexec' | null>(null);
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

  const handleToggleAutoExec = async () => {
    setIsLoading('autoexec');
    try {
      await onToggleAutoExecuteSignals(!autoExecuteSignals);
    } finally {
      setIsLoading(null);
    }
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
    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
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
                ? 'border-emerald-500 bg-emerald-500/10'
                : status === 'stopped'
                  ? 'border-rose-500 bg-rose-500/10'
                  : 'border-zinc-500 bg-zinc-500/10'
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
              status === 'running' && 'text-emerald-400',
              status === 'stopped' && 'text-rose-500',
              status === 'loading' && 'text-zinc-400'
            )}
          >
            {status === 'running' ? 'OPERATIONAL' : status === 'stopped' ? 'TERMINATED' : 'INITIALIZING...'}
          </p>
          {status === 'running' && activeStrategy && <p className="text-xs text-emerald-400/80 font-mono">Running Strategy: {activeStrategy}</p>}
        </div>

        {/* Control Buttons */}
        {/* Control Buttons */}
        <div className="flex gap-3">
          {/* START / CONFIGURE */}
          <Button
            onClick={() => openDialog('start')}
            disabled={status === 'running' || isLoading !== null}
            className={cn(
              "control-btn transition-all duration-300",
              status !== 'running'
                ? "bg-emerald-600 text-white hover:bg-emerald-500 shadow-[0_0_18px_rgba(16,185,129,0.45)] hover:shadow-[0_0_28px_rgba(16,185,129,0.65)] border-transparent"
                : "bg-transparent text-zinc-600 border border-zinc-700 cursor-not-allowed shadow-none"
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

          {/* STOP */}
          <Button
            onClick={() => openDialog('stop')}
            disabled={status !== 'running' || isLoading !== null}
            className={cn(
              "control-btn transition-all duration-300",
              status === 'running'
                ? "bg-rose-600 text-white hover:bg-rose-500 shadow-[0_0_18px_rgba(225,29,72,0.45)] hover:shadow-[0_0_28px_rgba(225,29,72,0.65)] border-transparent"
                : "bg-transparent text-zinc-600 border border-zinc-700 cursor-not-allowed shadow-none"
            )}
          >
            {isLoading === 'stop' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Square className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">Terminate</span>
          </Button>

          {/* RESTART */}
          <Button
            onClick={() => openDialog('restart')}
            disabled={status !== 'running' || isLoading !== null}
            className={cn(
              "control-btn transition-all duration-300",
              status === 'running'
                ? "bg-zinc-600 text-white hover:bg-zinc-500 shadow-[0_0_16px_rgba(161,161,170,0.3)] hover:shadow-[0_0_24px_rgba(161,161,170,0.5)] border-transparent"
                : "bg-transparent text-zinc-600 border border-zinc-700 cursor-not-allowed shadow-none"
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

      <div className="mt-6 pt-4 border-t border-border/40 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-foreground">Auto Signal Execution</p>
          <p className="text-xs text-muted-foreground">
            {autoExecuteSignals
              ? 'Enabled: bot opens entries automatically.'
              : 'Disabled: signals are notify-only, entry is manual.'}
          </p>
        </div>
        <Button
          onClick={handleToggleAutoExec}
          disabled={isLoading !== null}
          variant="outline"
          className={cn(
            "min-w-[200px] h-11 px-5 font-semibold border-2 transition-all duration-200",
            autoExecuteSignals
              ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/60 hover:bg-emerald-500/25 hover:border-emerald-400/80 shadow-[0_0_16px_rgba(16,185,129,0.3)]"
              : "bg-rose-500/10 text-rose-400 border-rose-500/50 hover:bg-rose-500/20 hover:border-rose-400/70 shadow-[0_0_16px_rgba(225,29,72,0.2)]",
            isLoading !== null && "opacity-60"
          )}
        >
          {isLoading === 'autoexec' ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <span className="inline-flex items-center gap-2.5">
              <span
                className={cn(
                  "w-2.5 h-2.5 rounded-full animate-pulse",
                  autoExecuteSignals
                    ? "bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]"
                    : "bg-rose-500 shadow-[0_0_8px_rgba(225,29,72,0.8)]"
                )}
              />
              {autoExecuteSignals ? "AUTO: ON" : "AUTO: OFF"}
            </span>
          )}
        </Button>
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
