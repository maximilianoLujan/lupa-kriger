import { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { createHttp } from '../lib/http'

export type FakeReply = { status: number; data?: unknown }
export type FakeHandler = (config: InternalAxiosRequestConfig) => FakeReply | Promise<FakeReply>

/** Status -1 simula que no hubo respuesta (red caída). */
export const NETWORK_DOWN = -1

/**
 * Cliente HTTP real (con interceptores) pero sin red: `handler` decide la respuesta de cada petición.
 * Devuelve también la lista de peticiones hechas, para asertar URL, método, headers y body.
 */
export function fakeHttp(handler: FakeHandler) {
  const calls: InternalAxiosRequestConfig[] = []
  const http = createHttp('https://api.test', {
    adapter: async (config) => {
      calls.push(config)
      const reply = await handler(config)
      if (reply.status === NETWORK_DOWN) {
        throw new AxiosError('Network Error', AxiosError.ERR_NETWORK, config)
      }
      const response = { status: reply.status, data: reply.data, statusText: '', headers: {}, config }
      // Igual que el adapter real: fuera de 2xx se rechaza con AxiosError.
      const ok = config.validateStatus ? config.validateStatus(reply.status) : reply.status < 300
      if (!ok) {
        throw new AxiosError(
          `Request failed with status code ${reply.status}`,
          reply.status >= 500 ? AxiosError.ERR_BAD_RESPONSE : AxiosError.ERR_BAD_REQUEST,
          config,
          null,
          response,
        )
      }
      return response
    },
  })
  return { http, calls }
}

/** Cliente que responde siempre lo mismo. */
export function replyWith(status: number, data?: unknown) {
  return fakeHttp(() => ({ status, data }))
}

export function bodyOf(config: InternalAxiosRequestConfig): unknown {
  return typeof config.data === 'string' ? JSON.parse(config.data) : config.data
}
