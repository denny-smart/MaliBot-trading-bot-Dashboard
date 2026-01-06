import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AdminUserList } from '@/components/dashboard/AdminUserList';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

export default function Users() {
    const { role } = useAuth();

    // Only admins can access this page
    if (role !== 'admin') {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <DashboardLayout title="User Management">
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">User Management</h1>
                    <p className="text-muted-foreground mt-2">
                        Manage user accounts, approvals, and permissions
                    </p>
                </div>

                <AdminUserList />
            </div>
        </DashboardLayout>
    );
}
