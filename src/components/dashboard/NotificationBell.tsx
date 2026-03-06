
import { useState } from 'react';
import { Bell, Check, Trash2 } from 'lucide-react';
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
                return 'text-emerald-300 bg-emerald-500/15 border-emerald-400/40';
            case 'warning':
                return 'text-amber-300 bg-amber-500/15 border-amber-400/40';
            case 'error':
                return 'text-rose-300 bg-rose-500/15 border-rose-400/40';
            case 'info':
            default:
                return 'text-sky-300 bg-sky-500/15 border-sky-400/40';
        }
    };

    const getNotificationAccent = (type: AppNotification['type']) => {
        switch (type) {
            case 'success':
                return 'border-l-emerald-400/70';
            case 'warning':
                return 'border-l-amber-400/70';
            case 'error':
                return 'border-l-rose-400/70';
            case 'info':
            default:
                return 'border-l-sky-400/70';
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
                        <div className="flex flex-col gap-2 p-2">
                            {notifications.map((notification) => (
                                <button
                                    key={notification.id}
                                    className={cn(
                                        'flex flex-col gap-2 p-3 text-left transition-colors rounded-lg border border-border/70 border-l-4 bg-card/60 hover:bg-accent/20',
                                        getNotificationAccent(notification.type),
                                        !notification.read && 'ring-1 ring-primary/35 border-primary/35'
                                    )}
                                    onClick={() => handleNotificationClick(notification)}
                                >
                                    <div className="flex items-start justify-between w-full">
                                        <span className={cn("text-xs font-semibold tracking-wide px-2.5 py-1 rounded-full border", getNotificationColor(notification.type))}>
                                            {getNotificationLabel(notification)}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-foreground/65">
                                                {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                                            </span>
                                            {!notification.read && (
                                                <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold leading-none text-foreground">
                                            {notification.title}
                                        </p>
                                        <p className="text-sm text-foreground/80 mt-1.5 line-clamp-2">
                                            {notification.message}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </PopoverContent>
        </Popover>
    );
}
