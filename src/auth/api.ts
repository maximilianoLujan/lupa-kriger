import type { AxiosInstance } from 'axios'
import { ApiError } from '../lib/http'
import type { User } from '../types/user'
import type { Session } from './session'

/**
 * Auth contra la API del ERP. El usuario es un miembro de la empresa con el permiso de la Lupa.
 *
 *   POST /v1/auth/login   { email, password } → { accessToken, refreshToken, user }
 *   POST /v1/auth/logout  { refreshToken }    → 204
 *   POST /v1/auth/refresh { refreshToken }    → { accessToken, refreshToken? }   (lo usa el cliente HTTP)
 */
interface LoginResponse {
  accessToken: string
  refreshToken: string
  user: { id: string; email: string; fullName: string }
}

export class ApiAuth {
  private readonly http: AxiosInstance

  constructor(http: AxiosInstance) {
    this.http = http
  }

  /** Devuelve la sesión o null si las credenciales son incorrectas. Otros errores lanzan. */
  async login(email: string, password: string): Promise<Session | null> {
    try {
      const { data } = await this.http.post<LoginResponse>(
        '/v1/auth/login',
        { email: email.trim(), password },
        { skipAuthRefresh: true },
      )
      const user: User = { username: data.user.email, name: data.user.fullName }
      return { user, accessToken: data.accessToken, refreshToken: data.refreshToken }
    } catch (error) {
      if (error instanceof ApiError && (error.status === 401 || error.status === 400)) return null
      throw error
    }
  }

  /** Revoca el refresh token en la API. No lanza: cerrar sesión siempre funciona del lado del front. */
  async logout(refreshToken: string | undefined): Promise<void> {
    if (!refreshToken) return
    try {
      await this.http.post('/v1/auth/logout', { refreshToken }, { skipAuthRefresh: true })
    } catch {
      // La sesión local ya se cerró; si la API no responde, el refresh token vence solo.
    }
  }
}
