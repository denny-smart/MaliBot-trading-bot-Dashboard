
import { useState } from 'react';
import { Bell, Check, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotifications, AppNotification } from '@/contexts/NotificationContext';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

export function NotificationBell() {
    const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotifications();
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();

    const handleNotificationClick = (notification: AppNotification) => {
        markAsRead(notification.id);
        if (notification.link) {
            setOpen(false);
            navigate(notification.link);
        }
    };

    const getNotificationColor = (type: AppNotification['type']) => {
        switch (type) {
            case 'success':
                return 'text-green-500 bg-green-500/10 border-green-500/20';
            case 'warning':
                return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
            case 'error':
                return 'text-red-500 bg-red-500/10 border-red-500/20';
            case 'info':
            default:
                return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
        }
    };

    const getNotificationLabel = (notification: AppNotification) => {
        if (notification.title === 'Trade Lost') {
            return 'LOSS';
        }

        return notification.type.toUpperCase();
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="w-5 h-5 text-muted-foreground" />
                    {unreadCount > 0 && (
                        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-0">
                <div className="flex items-center justify-between p-4 border-b">
                    <h4 className="font-semibold leading-none">Notifications</h4>
                    {notifications.length > 0 && (
                        <div className="flex gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                onClick={markAllAsRead}
                                title="Mark all as read"
                            >
                                <Check className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                onClick={clearAll}
                                title="Clear all"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    )}
                </div>
                <ScrollArea className="h-[300px]">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full p-4 text-muted-foreground">
                            <Bell className="w-8 h-8 mb-2 opacity-20" />
                            <p className="text-sm">No new notifications</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-1 p-1">
                            {notifications.map((notification) => (
                                <button
                                    key={notification.id}
                                    className={cn(
                                        'flex flex-col gap-1 p-3 text-left transition-colors rounded-md hover:bg-accent relative group',
                                        !notification.read && 'bg-accent/50'
                                    )}
                                    onClick={() => handleNotificationClick(notification)}
                                >
                                    <div className="flex items-start justify-between w-full">
                                        <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full border", getNotificationColor(notification.type))}>
                                            {getNotificationLabel(notification)}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                                        </span>
                                    </div>
                                    <div className="mt-1">
                                        <p className="text-sm font-medium leading-none">
                                            {notification.title}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                            {notification.message}
                                        </p>
                                    </div>
                                    {!notification.read && (
                                        <span className="absolute top-3 right-3 w-2 h-2 bg-primary rounded-full" />
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </PopoverContent>
        </Popover>
    );
}
