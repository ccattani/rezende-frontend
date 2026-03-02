import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { TOKEN_KEY } from '../services/api/client'
import { me } from '../services/api/me'
import type { AuthUser } from '../types/auth'
import { getItem, setItem, deleteItem } from '../utils/storage'

type LoginResponse = {
  token: string
  user: AuthUser
}

type AuthState = {
  token: string | null
  user: AuthUser | null
  isBootstrapping: boolean
  signIn: (data: LoginResponse) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isBootstrapping, setIsBootstrapping] = useState(true)

  useEffect(() => {
    ;(async () => {
      try {
        const t = await getItem(TOKEN_KEY)

        if (!t) {
          setIsBootstrapping(false)
          return
        }

        setToken(t)

        const u = await me() // GET /auth/me (interceptor injeta o token)
        setUser(u)
      } catch (e) {
        await deleteItem(TOKEN_KEY)
        setToken(null)
        setUser(null)
      } finally {
        setIsBootstrapping(false)
      }
    })()
  }, [])

  async function signIn(data: LoginResponse) {
    await setItem(TOKEN_KEY, data.token)
    setToken(data.token)
    setUser(data.user)
  }

  async function signOut() {
    await deleteItem(TOKEN_KEY)
    setToken(null)
    setUser(null)
  }

  const value = useMemo(
    () => ({ token, user, isBootstrapping, signIn, signOut }),
    [token, user, isBootstrapping]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}