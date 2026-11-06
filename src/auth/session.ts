import type { User } from '../types/user'

/** Lo que se guarda de la sesión: el usuario para la UI y los tokens de la API (solo con `VITE_DATA_SOURCE=api`). */
export interface Session {
  user: User
  accessToken?: string
  refreshToken?: string
}

const USER_KEY = 'auth:user'
const TOKENS_KEY = 'auth:tokens'

/** Evento que avisa que la API rechazó la sesión (401): el `AuthProvider` vuelve al login. */
export const SESSION_EXPIRED_EVENT = 'auth:expired'

export function readSession(): Session | null {
  try {
    const rawUser = sessionStorage.getItem(USER_KEY)
    if (!rawUser) return null
    const user = JSON.parse(rawUser) as User
    const rawTokens = sessionStorage.getItem(TOKENS_KEY)
    const tokens = rawTokens ? (JSON.parse(rawTokens) as Pick<Session, 'accessToken' | 'refreshToken'>) : {}
    return { user, ...tokens }
  } catch {
    return null
  }
}

export function writeSession({ user, accessToken, refreshToken }: Session) {
  sessionStorage.setItem(USER_KEY, JSON.stringify(user))
  if (accessToken) {
    sessionStorage.setItem(TOKENS_KEY, JSON.stringify({ accessToken, refreshToken }))
  } else {
    sessionStorage.removeItem(TOKENS_KEY)
  }
}

export function clearSession() {
  sessionStorage.removeItem(USER_KEY)
  sessionStorage.removeItem(TOKENS_KEY)
}

/** Token de acceso vigente, o null si no hay sesión con la API. */
export function readAccessToken(): string | null {
  return readSession()?.accessToken ?? null
}

/** Cierra la sesión local y avisa a la app (la API devolvió 401). */
export function expireSession() {
  clearSession()
  window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT))
}
