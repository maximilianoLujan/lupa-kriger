import type { User } from '../types/user'
import type { Session } from './session'

/**
 * Login contra la API del ERP (`POST /v1/auth/login`). El usuario es un miembro de la empresa con el permiso de la
 * Lupa; la API responde con los tokens y sus datos.
 */
interface LoginResponse {
  accessToken: string
  refreshToken: string
  user: { id: string; email: string; fullName: string }
}

export class ApiAuth {
  private readonly baseUrl: string
  private readonly fetchFn: typeof fetch

  constructor(baseUrl: string, fetchFn: typeof fetch = fetch) {
    if (!baseUrl) throw new Error('ApiAuth necesita una URL base (VITE_API_URL)')
    this.baseUrl = baseUrl
    this.fetchFn = fetchFn
  }

  /** Devuelve la sesión o null si las credenciales son incorrectas. Otros errores lanzan. */
  async login(email: string, password: string): Promise<Session | null> {
    const response = await this.fetchFn(`${this.baseUrl}/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ email: email.trim(), password }),
    })
    if (response.status === 401 || response.status === 400) return null
    if (!response.ok) throw new Error(`Error ${response.status} al iniciar sesión`)
    const body = (await response.json()) as LoginResponse
    const user: User = { username: body.user.email, name: body.user.fullName }
    return { user, accessToken: body.accessToken, refreshToken: body.refreshToken }
  }

  /** Revoca el refresh token en la API. No lanza: cerrar sesión siempre funciona del lado del front. */
  async logout(refreshToken: string | undefined): Promise<void> {
    if (!refreshToken) return
    try {
      await this.fetchFn(`${this.baseUrl}/v1/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      })
    } catch {
      // La sesión local ya se cerró; si la API no responde, el refresh token vence solo.
    }
  }
}
