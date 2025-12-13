import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { devtools } from 'zustand/middleware'
import { logout as authLogout, setTokenAuth } from '../utils/auth'
import type { AuthStore, User } from '@/types'

export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        token: null,
        isAuthenticated: false,
        role: undefined,
        refreshToken: null,
        error: null,

        setAuth: (user: User, token: string, refreshToken: string) => {
          setTokenAuth(token, refreshToken)
          set({
            user,
            token,
            refreshToken,
            isAuthenticated: true,
            error: null,
          })
        },

        setUser: (user: User) => {
          set({ user })
        },

        logout: () => {
          authLogout()
          set({
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
            error: null,
          })
        },

        clearError: () => set({ error: null }),
      }),
      {
        name: 'auth-storage',
        storage: createJSONStorage(() => localStorage),
        partialize: (state: any) => ({
          user: state.user,
          token: state.token,
          refreshToken: state.refreshToken,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    ),
    { name: 'auth-store' }
  )
)
