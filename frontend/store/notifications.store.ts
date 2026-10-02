import { create } from 'zustand';

export interface Notification {
  id: string;
  title: string;
  message: string;
  severity: 'critical' | 'warning' | 'info' | 'success';
  timestamp: string;
  isRead: boolean;
  href?: string;
}

interface NotificationsState {
  notifications: Notification[];
  pendingApprovals: number;
  addNotification: (n: Omit<Notification, 'id' | 'isRead'>) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  clearAll: () => void;
  setPendingApprovals: (count: number) => void;
}

export const useNotificationsStore = create<NotificationsState>()((set) => ({
  notifications: [],
  pendingApprovals: 0,
  addNotification: (n) =>
    set((state) => ({
      notifications: [
        {
          ...n,
          id: `notif-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          isRead: false,
        },
        ...state.notifications,
      ],
    })),
  markRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n
      ),
    })),
  markAllRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
    })),
  clearAll: () => set({ notifications: [] }),
  setPendingApprovals: (count) => set({ pendingApprovals: count }),
}));
