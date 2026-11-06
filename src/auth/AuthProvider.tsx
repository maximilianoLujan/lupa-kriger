import { useEffect, useState, type ReactNode } from 'react'
import { env } from '../config/env'
import { getHttp } from '../lib/http'
import type { User } from '../types/user'
import { ApiAuth } from './api'
import { AuthContext } from './context'
import { authenticate } from './credentials'
import { clearSession, readSession, SESSION_EXPIRED_EVENT, writeSession, type Session } from './session'

interface AuthProviderProps {
  children: ReactNode
  /** Inyectable para tests. Por defecto, la API de `VITE_API_URL` cuando `VITE_DATA_SOURCE=api`; si no, el mock. */
  apiAuth?: ApiAuth | null
}

function defaultApiAuth(): ApiAuth | null {
  return env.dataSource === 'api' ? new ApiAuth(getHttp()) : null
}

/** Login mock del MVP: usuarios de `credentials.ts`, con una demora para mostrar el estado de carga. */
async function mockLogin(username: string, password: string): Promise<Session | null> {
  await new Promise((r) => setTimeout(r, 500))
  const found = authenticate(username, password)
  return found ? { user: found } : null
}

export function AuthProvider({ children, apiAuth = defaultApiAuth() }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(() => readSession()?.user ?? null)

  // Si la API rechaza la sesión (401), se vuelve al login.
  useEffect(() => {
    const onExpired = () => setUser(null)
    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired)
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired)
  }, [])

  async function login(username: string, password: string) {
    const session = apiAuth ? await apiAuth.login(username, password) : await mockLogin(username, password)
    if (!session) return false
    writeSession(session)
    setUser(session.user)
    return true
  }

  function logout() {
    const refreshToken = readSession()?.refreshToken
    clearSession()
    setUser(null)
    void apiAuth?.logout(refreshToken)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
