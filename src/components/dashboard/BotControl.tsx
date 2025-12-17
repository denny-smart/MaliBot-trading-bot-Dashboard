import { Play, Square, RotateCw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface BotControlProps {
  status: 'running' | 'stopped' | 'loading';
  onStart: () => Promise<void>;
  onStop: () => Promise<void>;
  onRestart: () => Promise<void>;
}

export function BotControl({ status, onStart, onStop, onRestart }: BotControlProps) {
  const [isLoading, setIsLoading] = useState<'start' | 'stop' | 'restart' | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogAction, setDialogAction] = useState<'start' | 'stop' | 'restart' | null>(null);

  const handleAction = async () => {
    if (!dialogAction) return;
    
    setIsLoading(dialogAction);
    try {
      if (dialogAction === 'start') await onStart();
      else if (dialogAction === 'stop') await onStop();
      else if (dialogAction === 'restart') await onRestart();
    } finally {
      setIsLoading(null);
      setDialogOpen(false);
    }
  };

  const openDialog = (action: 'start' | 'stop' | 'restart') => {
    setDialogAction(action);
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
      default:
        return { title: '', description: '' };
    }
  };

  const dialogContent = getDialogContent();

  return (
    <div className="stat-card">
      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Status Indicator */}
        <div
          className={cn(
            'relative flex items-center justify-center w-24 h-24 rounded-full border-4 transition-all duration-300',
            status === 'running'
              ? 'border-success/50 bg-success/10 animate-glow'
              : status === 'stopped'
              ? 'border-destructive/50 bg-destructive/10'
              : 'border-primary/50 bg-primary/10'
          )}
        >
          <div
            className={cn(
              'w-12 h-12 rounded-full',
              status === 'running' && 'bg-success animate-pulse',
              status === 'stopped' && 'bg-destructive',
              status === 'loading' && 'bg-primary animate-pulse'
            )}
          />
        </div>

        {/* Status Text */}
        <div className="text-center sm:text-left flex-1">
          <p className="text-sm text-muted-foreground">Bot Status</p>
          <p
            className={cn(
              'text-2xl font-bold',
              status === 'running' && 'text-success',
              status === 'stopped' && 'text-destructive',
              status === 'loading' && 'text-primary'
            )}
          >
            {status === 'running' ? 'Running' : status === 'stopped' ? 'Stopped' : 'Loading...'}
          </p>
        </div>

        {/* Control Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={() => openDialog('start')}
            disabled={status === 'running' || isLoading !== null}
            className="control-btn control-btn-start"
          >
            {isLoading === 'start' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">Start</span>
          </Button>

          <Button
            onClick={() => openDialog('stop')}
            disabled={status === 'stopped' || isLoading !== null}
            className="control-btn control-btn-stop"
          >
            {isLoading === 'stop' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Square className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">Stop</span>
          </Button>

          <Button
            onClick={() => openDialog('restart')}
            disabled={isLoading !== null}
            className="control-btn control-btn-restart"
          >
            {isLoading === 'restart' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RotateCw className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">Restart</span>
          </Button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogContent.title}</DialogTitle>
            <DialogDescription>{dialogContent.description}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAction} disabled={isLoading !== null}>
              {isLoading !== null ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'Confirm'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
