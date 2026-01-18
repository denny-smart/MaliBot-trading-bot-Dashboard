import { useNavigate } from 'react-router-dom';
import { Bot, Clock, LogOut, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Send } from 'lucide-react';

export default function PendingApproval() {
  const navigate = useNavigate();
  const { logout, checkApproval, user } = useAuth();

  const [isChecking, setIsChecking] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [lockoutTime, setLockoutTime] = useState<number | null>(null);

  useEffect(() => {
    const lastRequest = localStorage.getItem('lastApprovalRequestTime');
    if (lastRequest) {
      const lastTime = parseInt(lastRequest, 10);
      const now = Date.now();
      const oneDay = 24 * 60 * 60 * 1000;

      if (now - lastTime < oneDay) {
        setLockoutTime(lastTime + oneDay);
      } else {
        localStorage.removeItem('lastApprovalRequestTime');
      }
    }
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleCheckAgain = async () => {
    setIsChecking(true);
    try {
      const approved = await checkApproval();
      if (approved) {
        toast({
          title: 'Account approved!',
          description: 'You now have access to the dashboard.',
        });
        navigate('/dashboard');
      } else {
        toast({
          title: 'Still pending',
          description: 'Your account is still awaiting approval.',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Could not check approval status.',
        variant: 'destructive',
      });
    } finally {
      setIsChecking(false);
    }
  };

  const handleRequestApproval = async () => {
    setIsRequesting(true);
    try {
      await api.auth.requestApproval();

      const now = Date.now();
      localStorage.setItem('lastApprovalRequestTime', now.toString());
      setLockoutTime(now + 24 * 60 * 60 * 1000);

      toast({
        title: 'Request Sent',
        description: 'The administrator has been notified of your request.',
      });
      setIsDialogOpen(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Could not send approval request. It might have already been sent.',
        variant: 'destructive',
      });
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-warning/20 via-background to-background" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-warning/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-warning/20 text-warning mb-4">
            <Clock className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Pending Approval</h1>
        </div>

        {/* Card */}
        <div className="glass-card rounded-2xl p-8 animate-fade-in text-center" style={{ animationDelay: '0.1s' }}>
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/20 text-primary mb-4">
            <img src="/favicon.png" alt="MaliBot Logo" className="w-8 h-8 object-contain" />
          </div>

          <h2 className="text-xl font-semibold text-foreground mb-4">Thanks for signing up!</h2>

          <p className="text-muted-foreground mb-2">
            Your account is waiting for administrator approval.
          </p>

          {user?.email && (
            <p className="text-sm text-muted-foreground mb-6">
              Signed in as: <span className="text-foreground font-medium">{user.email}</span>
            </p>
          )}

          <p className="text-sm text-muted-foreground mb-8">
            Please check back later or contact an administrator for access.
          </p>

          <div className="flex flex-col gap-3">
            <Button
              onClick={handleCheckAgain}
              disabled={isChecking}
              variant="outline"
              className="w-full"
            >
              {isChecking ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Check Again
                </>
              )}
            </Button>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full" disabled={isRequesting || !!lockoutTime}>
                  <Send className="w-4 h-4 mr-2" />
                  {lockoutTime
                    ? `Request Locked (${Math.ceil((lockoutTime - Date.now()) / (1000 * 60 * 60))}h)`
                    : 'Request Approval'}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Request Account Approval</DialogTitle>
                  <DialogDescription>
                    This will send a notification to the administrator that you are waiting for approval.
                    You can only send one request every 24 hours.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <p className="text-sm text-foreground">
                    Please confirm you want to send this request.
                  </p>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleRequestApproval} disabled={isRequesting}>
                    {isRequesting ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      'Send Request'
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button
              onClick={handleLogout}
              variant="ghost"
              className="w-full text-muted-foreground hover:text-foreground"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
