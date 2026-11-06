import axios, { AxiosError, type AxiosInstance, type AxiosRequestConfig, type InternalAxiosRequestConfig } from 'axios'
import { expireSession, readSession, writeSession } from '../auth/session'
import { env } from '../config/env'

declare module 'axios' {
  export interface AxiosRequestConfig {
    /** Para login, refresh y logout: un 401 acá no significa sesión vencida. */
    skipAuthRefresh?: boolean
  }
}

/** Error normalizado de la API. `status` 0 significa que no hubo respuesta (red caída, timeout). */
export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export const SESSION_EXPIRED_MESSAGE = 'Tu sesión venció. Volvé a ingresar.'
export const NETWORK_ERROR_MESSAGE = 'No se pudo conectar con el servidor.'

interface RefreshResponse {
  accessToken: string
  refreshToken?: string
}

type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean }

/**
 * Crea un cliente HTTP para la API del ERP:
 * - manda el token de acceso en `Authorization: Bearer`;
 * - ante un 401 intenta renovar la sesión una vez (`POST /v1/auth/refresh`) y repite la petición;
 * - si no puede renovar, cierra la sesión local y avisa a la app;
 * - convierte cualquier fallo en `ApiError` con status y mensaje legible.
 */
export function createHttp(baseURL: string, config: AxiosRequestConfig = {}): AxiosInstance {
  if (!baseURL) throw new Error('El cliente HTTP necesita una URL base (VITE_API_URL)')

  const http = axios.create({
    baseURL,
    timeout: 15_000,
    headers: { Accept: 'application/json' },
    ...config,
  })

  // Un solo refresh en vuelo aunque fallen varias peticiones a la vez.
  let refreshing: Promise<boolean> | null = null
  function refreshSession(): Promise<boolean> {
    refreshing ??= (async () => {
      const session = readSession()
      if (!session?.refreshToken) return false
      try {
        const { data } = await http.post<RefreshResponse>(
          '/v1/auth/refresh',
          { refreshToken: session.refreshToken },
          { skipAuthRefresh: true },
        )
        writeSession({
          user: session.user,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken ?? session.refreshToken,
        })
        return true
      } catch {
        return false
      } finally {
        refreshing = null
      }
    })()
    return refreshing
  }

  http.interceptors.request.use((request) => {
    const token = readSession()?.accessToken
    if (token && !request.headers.Authorization) {
      request.headers.Authorization = `Bearer ${token}`
    }
    return request
  })

  http.interceptors.response.use(
    (response) => response,
    async (error: unknown) => {
      if (!axios.isAxiosError(error)) throw error
      const request = error.config as RetriableConfig | undefined
      const status = error.response?.status

      if (status === 401 && request && !request.skipAuthRefresh) {
        if (!request._retried && (await refreshSession())) {
          request._retried = true
          delete request.headers.Authorization
          return http(request)
        }
        expireSession()
        throw new ApiError(401, SESSION_EXPIRED_MESSAGE)
      }

      throw toApiError(error)
    },
  )

  return http
}

function toApiError(error: AxiosError<{ message?: string } | undefined>): ApiError {
  if (!error.response) return new ApiError(0, NETWORK_ERROR_MESSAGE)
  const { status, data } = error.response
  const message = typeof data?.message === 'string' ? data.message : `Error ${status} al llamar a ${error.config?.url ?? 'la API'}`
  return new ApiError(status, message)
}

let shared: AxiosInstance | null = null

/** Cliente compartido de la app, construido con `VITE_API_URL` la primera vez que se usa. */
export function getHttp(): AxiosInstance {
  shared ??= createHttp(env.apiUrl)
  return shared
}

/** Mensaje para mostrar al usuario a partir de cualquier error. */
export function errorMessage(error: unknown, fallback = 'Algo salió mal.'): string {
  return error instanceof Error && error.message ? error.message : fallback
}
