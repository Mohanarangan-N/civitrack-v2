import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User } from '../types'

interface AuthStore {
  user: User | null
  token: string | null
  lang: 'en'|'ta'|'fr'
  setAuth: (user: User, token: string) => void
  setLang: (lang: 'en'|'ta'|'fr') => void
  logout: () => void
}

export const useAuthStore = create<AuthStore>()(persist((set) => ({
  user: null, token: null, lang: 'en',
  setAuth: (user, token) => { localStorage.setItem('ct_token', token); set({ user, token }) },
  setLang: (lang) => set({ lang }),
  logout: () => { localStorage.removeItem('ct_token'); set({ user: null, token: null }) },
}), { name: 'civitrack-auth' }))
