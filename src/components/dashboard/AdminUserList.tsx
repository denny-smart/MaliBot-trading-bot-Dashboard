import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { Check, X, Shield, User as UserIcon, Loader2, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Profile {
    id: string;
    email: string; // Note: email might not be in profiles depending on schema, usually it's in auth.users but often replicated or joined. 
    // If email is not in profiles, we might need to fetch it differently or assume it's there. 
    // For this implementation, I'll assume a view or replication, 
    // OR I'll just show ID/Metadata if email isn't available directly on profile.
    // Actually, usually profiles has email or username. Let's check schema or assume email is present for now.
    role: 'admin' | 'user';
    is_approved: boolean | null;
    created_at: string;
    first_name?: string;
    last_name?: string;
}

export function AdminUserList() {
    const [users, setUsers] = useState<Profile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    const handleDelete = async (userId: string) => {
        if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

        setProcessingId(userId);
        try {
            const { error } = await supabase
                .from('profiles')
                .delete()
                .eq('id', userId);

            if (error) throw error;

            toast({
                title: 'User deleted',
                description: 'The user profile has been removed.',
            });

            // Optimistic update
            setUsers(prev => prev.filter(u => u.id !== userId));
        } catch (error: any) {
            toast({
                title: 'Error deleting user',
                description: error.message,
                variant: 'destructive',
            });
        } finally {
            setProcessingId(null);
        }
    };

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setUsers(data as Profile[]);
        } catch (error: any) {
            console.error('Error fetching users:', error);
            toast({
                title: 'Error fetching users',
                description: error.message,
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();

        // Subscribe to realtime changes
        const channel = supabase
            .channel('schema-db-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'profiles',
                },
                (payload) => {
                    // Handle realtime updates without full refetch
                    if (payload.eventType === 'INSERT') {
                        const newUser = payload.new as Profile;
                        setUsers(prev => [newUser, ...prev]);
                    } else if (payload.eventType === 'UPDATE') {
                        const updatedUser = payload.new as Profile;
                        setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
                    } else if (payload.eventType === 'DELETE') {
                        const deletedUser = payload.old as Profile;
                        setUsers(prev => prev.filter(u => u.id !== deletedUser.id));
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const handleApprove = async (userId: string) => {
        setProcessingId(userId);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ is_approved: true })
                .eq('id', userId);

            if (error) throw error;

            toast({
                title: 'User approved',
                description: 'The user has been granted access.',
            });

            // Optimistic update
            setUsers(users.map(u => u.id === userId ? { ...u, is_approved: true } : u));
        } catch (error: any) {
            toast({
                title: 'Error approving user',
                description: error.message,
                variant: 'destructive',
            });
        } finally {
            setProcessingId(null);
        }
    };

    const handleRevoke = async (userId: string) => {
        setProcessingId(userId);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ is_approved: false })
                .eq('id', userId);

            if (error) throw error;

            toast({
                title: 'Access Revoked',
                description: 'The user access has been revoked.',
            });

            // Optimistic update
            setUsers(users.map(u => u.id === userId ? { ...u, is_approved: false } : u));
        } catch (error: any) {
            toast({
                title: 'Error revoking access',
                description: error.message,
                variant: 'destructive',
            });
        } finally {
            setProcessingId(null);
        }
    };

    // Filter users
    const pendingUsers = users.filter(u => !u.is_approved);
    const approvedUsers = users.filter(u => u.is_approved);

    if (isLoading && users.length === 0) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const UserTable = ({ data, showApprove = false }: { data: Profile[], showApprove?: boolean }) => (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {data.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                            No users found.
                        </TableCell>
                    </TableRow>
                ) : (
                    data.map((user) => (
                        <TableRow key={user.id}>
                            <TableCell>
                                <div className="flex flex-col">
                                    <span className="font-medium">{user.first_name} {user.last_name}</span>
                                    <span className="text-xs text-muted-foreground">{user.email || 'No email'}</span>
                                </div>
                            </TableCell>
                            <TableCell>
                                <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                                    {user.role}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                {user.is_approved ? (
                                    <Badge variant="outline" className="text-green-600 border-green-600">Approved</Badge>
                                ) : (
                                    <Badge variant="outline" className="text-yellow-600 border-yellow-600">Pending</Badge>
                                )}
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                                {user.created_at && formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                    {showApprove && !user.is_approved && (
                                        <Button
                                            size="sm"
                                            onClick={() => handleApprove(user.id)}
                                            disabled={processingId === user.id}
                                        >
                                            {processingId === user.id ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <>
                                                    <Check className="h-4 w-4 mr-1" /> Approve
                                                </>
                                            )}
                                        </Button>
                                    )}
                                    {showApprove && user.is_approved && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="text-yellow-600 border-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
                                            onClick={() => handleRevoke(user.id)}
                                            disabled={processingId === user.id}
                                        >
                                            {processingId === user.id ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <>
                                                    <X className="h-4 w-4 mr-1" /> Revoke
                                                </>
                                            )}
                                        </Button>
                                    )}
                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => handleDelete(user.id)}
                                        disabled={processingId === user.id}
                                    >
                                        {processingId === user.id ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Trash2 className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))
                )}
            </TableBody>
        </Table>
    );

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    User Management
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="pending">
                    <TabsList className="mb-4">
                        <TabsTrigger value="pending" className="relative">
                            Pending
                            {pendingUsers.length > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-white">
                                    {pendingUsers.length}
                                </span>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="all">All Users</TabsTrigger>
                    </TabsList>

                    <TabsContent value="pending">
                        <UserTable data={pendingUsers} showApprove={true} />
                    </TabsContent>

                    <TabsContent value="all">
                        <UserTable data={approvedUsers.concat(pendingUsers)} />
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}
