import React, { useState, useEffect } from 'react';
import { notificationsAPI } from '@/api';
import type { Notification } from '@/types';
import { Bell, Check, Clock, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { timeAgo } from '@/utils/helpers';
import toast from 'react-hot-toast';
import { useUIStore } from '@/store/uiStore';

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { setUnreadNotifications } = useUIStore();

  const loadNotifications = async () => {
    try {
      const res = await notificationsAPI.getAll();
      setNotifications(res.notifications || []);
      setUnreadNotifications(res.unread_count || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await notificationsAPI.markAllRead();
      setUnreadNotifications(0);
      toast.success('All notifications marked as read');
      loadNotifications();
    } catch {
      toast.error('Failed to mark notifications read');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary flex items-center gap-2">
            <Bell size={24} className="text-accent" />
            Real-Time Notifications
          </h1>
          <p className="text-xs text-text-muted mt-0.5">Socket.io push alerts for status updates & verification</p>
        </div>

        <Button size="sm" variant="secondary" onClick={handleMarkAllRead}>
          <CheckCheck size={14} /> Mark All Read
        </Button>
      </div>

      <div className="card p-0 overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-8 text-center text-xs text-text-muted">Loading notifications...</div>
        ) : notifications.length > 0 ? (
          <div className="divide-y divide-primary/10">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`p-4 flex items-start gap-3 transition-colors ${
                  !n.is_read ? 'bg-accent/10 border-l-4 border-l-accent' : 'hover:bg-primary/5'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center text-accent flex-shrink-0 mt-0.5">
                  <Bell size={16} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-bold text-sm text-text-primary">{n.title}</h4>
                    <span className="text-[10px] text-text-muted">{timeAgo(n.created_at)}</span>
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed">{n.message}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-xs text-text-muted">
            No notifications yet. You will receive live alerts here.
          </div>
        )}
      </div>
    </div>
  );
};
