import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import { toast } from '@/hooks/use-toast';
import { Loader2, Save, RotateCcw, Lock } from 'lucide-react';

const configSchema = z.object({
  stake_amount: z.number().min(1).max(1000),
  max_daily_trades: z.number().min(1).max(100),
  max_daily_loss: z.number().min(1).max(1000),
  stop_loss_percent: z.number().min(0).max(100),
  take_profit_percent: z.number().min(0).max(100),
  trailing_stop_enabled: z.boolean(),
  trailing_stop_distance: z.number().min(0).max(50),
  max_consecutive_losses: z.number().min(1).max(20),
  strategy: z.string(),
  timeframe: z.string(),
  signal_threshold: z.number().min(0).max(100),
});

const passwordSchema = z
  .object({
    current_password: z.string().min(1, 'Current password is required'),
    new_password: z.string().min(8, 'Password must be at least 8 characters'),
    confirm_password: z.string(),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords don't match",
    path: ['confirm_password'],
  });

type ConfigForm = z.infer<typeof configSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

export default function Settings() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ConfigForm>({
    resolver: zodResolver(configSchema),
    defaultValues: {
      stake_amount: 10,
      max_daily_trades: 50,
      max_daily_loss: 100,
      stop_loss_percent: 5,
      take_profit_percent: 10,
      trailing_stop_enabled: false,
      trailing_stop_distance: 2,
      max_consecutive_losses: 5,
      strategy: 'default',
      timeframe: '1m',
      signal_threshold: 70,
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    setIsLoading(true);
    try {
      const response = await api.config.current();
      if (response.data) {
        reset(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch config:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: ConfigForm) => {
    setIsSaving(true);
    try {
      await api.config.update(data);
      toast({
        title: 'Settings saved',
        description: 'Your bot configuration has been updated.',
      });
    } catch (error: any) {
      toast({
        title: 'Failed to save settings',
        description: error.response?.data?.detail || 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const onPasswordChange = async (data: PasswordForm) => {
    setIsChangingPassword(true);
    try {
      await api.auth.changePassword(data.current_password, data.new_password);
      toast({
        title: 'Password changed',
        description: 'Your password has been updated successfully.',
      });
      resetPassword();
    } catch (error: any) {
      toast({
        title: 'Failed to change password',
        description: error.response?.data?.detail || 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const stopLossPercent = watch('stop_loss_percent');
  const takeProfitPercent = watch('take_profit_percent');
  const signalThreshold = watch('signal_threshold');
  const trailingStopEnabled = watch('trailing_stop_enabled');

  if (isLoading) {
    return (
      <DashboardLayout title="Settings">
        <div className="space-y-6">
          <Skeleton className="h-12 w-96" />
          <Skeleton className="h-[600px]" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Settings">
      <Tabs defaultValue="bot" className="space-y-6">
        <TabsList className="bg-secondary">
          <TabsTrigger value="bot">Bot Configuration</TabsTrigger>
          <TabsTrigger value="account">Account & Security</TabsTrigger>
        </TabsList>

        <TabsContent value="bot" className="space-y-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Trading Parameters */}
            <div className="stat-card">
              <h3 className="font-semibold text-foreground mb-6">Trading Parameters</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="stake_amount">Stake Amount ($)</Label>
                  <Input
                    id="stake_amount"
                    type="number"
                    {...register('stake_amount', { valueAsNumber: true })}
                  />
                  {errors.stake_amount && (
                    <p className="text-xs text-destructive">{errors.stake_amount.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max_daily_trades">Max Daily Trades</Label>
                  <Input
                    id="max_daily_trades"
                    type="number"
                    {...register('max_daily_trades', { valueAsNumber: true })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max_daily_loss">Max Daily Loss ($)</Label>
                  <Input
                    id="max_daily_loss"
                    type="number"
                    {...register('max_daily_loss', { valueAsNumber: true })}
                  />
                </div>
              </div>
            </div>

            {/* Risk Management */}
            <div className="stat-card">
              <h3 className="font-semibold text-foreground mb-6">Risk Management</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Label>Stop Loss: {stopLossPercent}%</Label>
                  <Slider
                    value={[stopLossPercent]}
                    onValueChange={([value]) => setValue('stop_loss_percent', value)}
                    max={100}
                    step={1}
                  />
                </div>

                <div className="space-y-4">
                  <Label>Take Profit: {takeProfitPercent}%</Label>
                  <Slider
                    value={[takeProfitPercent]}
                    onValueChange={([value]) => setValue('take_profit_percent', value)}
                    max={100}
                    step={1}
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-secondary">
                  <div>
                    <Label htmlFor="trailing_stop">Enable Trailing Stop</Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Automatically adjust stop loss as profit increases
                    </p>
                  </div>
                  <Switch
                    id="trailing_stop"
                    checked={trailingStopEnabled}
                    onCheckedChange={(checked) => setValue('trailing_stop_enabled', checked)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max_consecutive_losses">Max Consecutive Losses</Label>
                  <Input
                    id="max_consecutive_losses"
                    type="number"
                    {...register('max_consecutive_losses', { valueAsNumber: true })}
                  />
                </div>
              </div>
            </div>

            {/* Strategy Settings */}
            <div className="stat-card">
              <h3 className="font-semibold text-foreground mb-6">Strategy Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label>Strategy</Label>
                  <Select
                    value={watch('strategy')}
                    onValueChange={(value) => setValue('strategy', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select strategy" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default</SelectItem>
                      <SelectItem value="aggressive">Aggressive</SelectItem>
                      <SelectItem value="conservative">Conservative</SelectItem>
                      <SelectItem value="scalping">Scalping</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Timeframe</Label>
                  <Select
                    value={watch('timeframe')}
                    onValueChange={(value) => setValue('timeframe', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select timeframe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1m">1 Minute</SelectItem>
                      <SelectItem value="5m">5 Minutes</SelectItem>
                      <SelectItem value="15m">15 Minutes</SelectItem>
                      <SelectItem value="1h">1 Hour</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <Label>Signal Threshold: {signalThreshold}%</Label>
                  <Slider
                    value={[signalThreshold]}
                    onValueChange={([value]) => setValue('signal_threshold', value)}
                    max={100}
                    step={1}
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <Button type="submit" disabled={isSaving} className="gap-2">
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save Changes
              </Button>
              <Button type="button" variant="outline" onClick={() => reset()} className="gap-2">
                <RotateCcw className="w-4 h-4" />
                Reset
              </Button>
            </div>
          </form>
        </TabsContent>

        <TabsContent value="account" className="space-y-6">
          {/* User Info */}
          <div className="stat-card">
            <h3 className="font-semibold text-foreground mb-6">Account Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Username</Label>
                <Input value={user?.username || ''} disabled />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={user?.email || ''} disabled />
              </div>
            </div>
          </div>

          {/* Change Password */}
          <div className="stat-card">
            <h3 className="font-semibold text-foreground mb-6 flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Change Password
            </h3>
            <form onSubmit={handlePasswordSubmit(onPasswordChange)} className="space-y-4 max-w-md">
              <div className="space-y-2">
                <Label htmlFor="current_password">Current Password</Label>
                <Input
                  id="current_password"
                  type="password"
                  {...registerPassword('current_password')}
                />
                {passwordErrors.current_password && (
                  <p className="text-xs text-destructive">
                    {passwordErrors.current_password.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="new_password">New Password</Label>
                <Input id="new_password" type="password" {...registerPassword('new_password')} />
                {passwordErrors.new_password && (
                  <p className="text-xs text-destructive">{passwordErrors.new_password.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm_password">Confirm New Password</Label>
                <Input
                  id="confirm_password"
                  type="password"
                  {...registerPassword('confirm_password')}
                />
                {passwordErrors.confirm_password && (
                  <p className="text-xs text-destructive">
                    {passwordErrors.confirm_password.message}
                  </p>
                )}
              </div>

              <Button type="submit" disabled={isChangingPassword}>
                {isChangingPassword ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Changing...
                  </>
                ) : (
                  'Change Password'
                )}
              </Button>
            </form>
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
