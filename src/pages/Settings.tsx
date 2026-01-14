import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Loader2, Save, RotateCcw, User, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

const visibleConfigSchema = z.object({
  stake_amount: z.number().min(0.1, "Stake amount must be at least 0.1"),
  active_strategy: z.string().min(1, "Strategy is required"),
  deriv_api_key: z.string().optional(),
});

type ConfigForm = z.infer<typeof visibleConfigSchema>;

export default function Settings() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasToken, setHasToken] = useState(false);
  const [isDeletingToken, setIsDeletingToken] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isEditingToken, setIsEditingToken] = useState(false);


  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isValid }, // Track isValid
  } = useForm<ConfigForm>({
    resolver: zodResolver(visibleConfigSchema),
    defaultValues: {
      stake_amount: 50,
      active_strategy: 'Conservative',
      deriv_api_key: '',
    },
  });

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    setIsLoading(true);
    try {
      const response = await api.config.current();
      if (response.data) {


        // Only reset the visible fields
        reset({
          stake_amount: response.data.stake_amount ?? 50,
          active_strategy: response.data.active_strategy ?? 'Conservative',
          deriv_api_key: '', // Always clear API key input on load
        });

        // Check if there is a token (even if masked)
        setHasToken(!!response.data.deriv_api_key && response.data.deriv_api_key !== '');
      }
    } catch (error) {
      console.error('Failed to fetch config:', error);
      toast({
        title: 'Error loading settings',
        description: 'Could not load current configuration.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: ConfigForm) => {
    setIsSaving(true);
    try {
      // Send only visible fields
      const payload = { ...data };

      // Filter out masked API key before sending if it hasn't changed
      if (payload.deriv_api_key && payload.deriv_api_key.startsWith('*****')) {
        delete payload.deriv_api_key;
      }

      // If API key is empty string (user didn't touch it), don't send it to avoid overwriting
      if (payload.deriv_api_key === '') {
        delete payload.deriv_api_key;
      }

      console.log('Saving config payload:', payload);

      await api.config.update(payload);



      if (data.deriv_api_key) {
        setHasToken(true);
        setIsEditingToken(false);
        setValue('deriv_api_key', ''); // Clear input for security after save
      }

      toast({
        title: 'Settings saved',
        description: 'Your bot configuration has been updated.',
      });
    } catch (error: any) {
      console.error('Save error:', error);
      toast({
        title: 'Failed to save settings',
        description: error.response?.data?.detail || 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteToken = async () => {
    setIsDeletingToken(true);
    try {
      if (!user?.id) throw new Error("User not authenticated");

      const { error } = await supabase
        .from('profiles')
        .update({ deriv_api_key: null })
        .eq('id', user.id);

      if (error) throw error;

      setValue('deriv_api_key', '');
      setHasToken(false);
      setShowDeleteDialog(false);
      toast({
        title: 'Token Deleted',
        description: 'Your Deriv API token has been removed.',
      });
    } catch (error: any) {
      toast({
        title: 'Failed to delete token',
        description: error.message || 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsDeletingToken(false);
    }
  };

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
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>

        <TabsContent value="bot" className="space-y-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* API Configuration */}
            <div className="stat-card">
              <h3 className="font-semibold text-foreground mb-6">API Configuration</h3>

              <div className="space-y-4">
                <Label htmlFor="deriv_api_key">Deriv API Token</Label>

                {hasToken && !isEditingToken ? (
                  <div className="flex items-center justify-between p-4 border rounded-lg bg-secondary/50">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <div>
                        <p className="font-medium">Token Saved</p>
                        <p className="text-xs text-muted-foreground">••••••••••••••••</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditingToken(true)}
                      >
                        Update
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => setShowDeleteDialog(true)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        id="deriv_api_key"
                        type="password"
                        placeholder={isEditingToken ? "Enter new API Token" : "Enter your Deriv API Token"}
                        {...register('deriv_api_key')}
                      />
                      {isEditingToken && (
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => {
                            setIsEditingToken(false);
                            setValue('deriv_api_key', '');
                          }}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                <p className="text-xs text-muted-foreground">
                  Your API token is encrypted and stored securely. Create a token with 'Read' and 'Trade' scopes in your Deriv account settings.
                </p>

                {/* Delete Confirmation Dialog */}
                <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Delete API Token?</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to delete your stored API token? The bot will stop running immediately if it is active.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
                      <Button
                        variant="destructive"
                        onClick={handleDeleteToken}
                        disabled={isDeletingToken}
                      >
                        {isDeletingToken ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        Delete Token
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

              </div>
            </div>

            {/* Trading Configuration */}
            <div className="stat-card">
              <h3 className="font-semibold text-foreground mb-6">Trading Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="stake_amount">Trade Stake Amount ($)</Label>
                  <Input
                    id="stake_amount"
                    type="number"
                    step="0.01"
                    min="0"
                    {...register('stake_amount', { valueAsNumber: true })}
                  />
                  <p className="text-xs text-muted-foreground">Amount to wager per trade.</p>
                  {errors.stake_amount && (
                    <p className="text-xs text-destructive">{errors.stake_amount.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Active Strategy</Label>
                  <Select
                    value={watch('active_strategy')}
                    onValueChange={(value) => setValue('active_strategy', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select strategy" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Conservative">Conservative (Trend Following)</SelectItem>
                      <SelectItem value="Scalping">Scalping (Coming Soon)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {watch('active_strategy') === 'Scalping'
                      ? "High Frequency Scalping - implementation pending."
                      : "Top-Down Market Structure Analysis."}
                  </p>
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
            <h3 className="font-semibold text-foreground mb-6 flex items-center gap-2">
              <User className="w-5 h-5" />
              Account Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={user?.email || ''} disabled />
              </div>
              <div className="space-y-2">
                <Label>User ID</Label>
                <Input value={user?.id || ''} disabled className="font-mono text-xs" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Account authentication is managed through Google. To change your email or password, please update your Google account settings.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
