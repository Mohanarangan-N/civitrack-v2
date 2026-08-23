import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIStore {
  language: 'en' | 'ta' | 'fr';
  sidebarOpen: boolean;
  unreadNotifications: number;
  setLanguage: (lang: 'en' | 'ta' | 'fr') => void;
  setSidebarOpen: (open: boolean) => void;
  setUnreadNotifications: (count: number) => void;
  incrementUnread: () => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      language: 'en',
      sidebarOpen: false,
      unreadNotifications: 0,
      setLanguage: (language) => set({ language }),
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      setUnreadNotifications: (count) => set({ unreadNotifications: count }),
      incrementUnread: () => set((s) => ({ unreadNotifications: s.unreadNotifications + 1 })),
    }),
    {
      name: 'civitrack-ui',
      partialize: (state) => ({ language: state.language }),
    }
  )
);
