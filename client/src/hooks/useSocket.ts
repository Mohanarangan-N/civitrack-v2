import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import toast from 'react-hot-toast';

let socket: Socket | null = null;

export function useSocket() {
  const { user, isAuthenticated } = useAuthStore();
  const { incrementUnread } = useUIStore();
  const initialized = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || initialized.current) return;
    initialized.current = true;

    socket = io('/', {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      console.log('Socket connected:', socket?.id);
      if (user) {
        socket?.emit('join_user', user.id);
        socket?.emit('join_ward', user.ward);
      }
    });

    socket.on('notification:new', (data) => {
      incrementUnread();
      toast(data.title || 'New notification', {
        icon: '🔔',
        style: {
          background: '#111E17',
          color: '#E8F5EE',
          border: '1px solid rgba(34,166,106,0.3)',
        },
      });
    });

    socket.on('achievement:unlock', (data) => {
      toast(`🏆 Achievement unlocked: ${data.badge}!`, {
        duration: 5000,
        style: {
          background: '#111E17',
          color: '#E8F5EE',
          border: '1px solid rgba(34,166,106,0.5)',
        },
      });
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      initialized.current = false;
    });

    return () => {
      socket?.disconnect();
      socket = null;
      initialized.current = false;
    };
  }, [isAuthenticated, user]);

  return socket;
}

export function getSocket() {
  return socket;
}

export function joinIssueRoom(issueId: string) {
  socket?.emit('join_issue', issueId);
}

export function leaveIssueRoom(issueId: string) {
  socket?.emit('leave_issue', issueId);
}
