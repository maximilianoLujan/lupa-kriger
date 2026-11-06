import type { InternalAxiosRequestConfig } from 'axios'
import { describe, expect, it, vi } from 'vitest'
import { SESSION_EXPIRED_EVENT, writeSession } from '../auth/session'
import { bodyOf, fakeHttp, NETWORK_DOWN, replyWith } from '../test/fakeHttp'
import { ApiError, createHttp, errorMessage, NETWORK_ERROR_MESSAGE, SESSION_EXPIRED_MESSAGE } from './http'

function auth(config: InternalAxiosRequestConfig) {
  return config.headers.Authorization
}

function loggedIn(accessToken = 'acc') {
  writeSession({ user: { username: 'a', name: 'A' }, accessToken, refreshToken: 'ref' })
}

describe('createHttp', () => {
  it('exige una URL base', () => {
    expect(() => createHttp('')).toThrow(/VITE_API_URL/)
  })

  it('manda el token de la sesión en Authorization', async () => {
    loggedIn()
    const { http, calls } = replyWith(200, { ok: true })

    const { data } = await http.get('/v1/lupa/warehouses')

    expect(data).toEqual({ ok: true })
    expect(auth(calls[0])).toBe('Bearer acc')
    expect(calls[0].headers.Accept).toBe('application/json')
  })

  it('sin sesión no manda Authorization', async () => {
    const { http, calls } = replyWith(200)
    await http.get('/x')
    expect(auth(calls[0])).toBeUndefined()
  })

  it('ante 401 renueva la sesión y repite la petición con el token nuevo', async () => {
    loggedIn('viejo')
    const { http, calls } = fakeHttp((config) => {
      if (config.url === '/v1/auth/refresh') return { status: 200, data: { accessToken: 'nuevo', refreshToken: 'ref2' } }
      return auth(config) === 'Bearer nuevo' ? { status: 200, data: 'ok' } : { status: 401 }
    })

    const { data } = await http.get('/v1/lupa/articles/search')

    expect(data).toBe('ok')
    expect(calls.map((c) => c.url)).toEqual(['/v1/lupa/articles/search', '/v1/auth/refresh', '/v1/lupa/articles/search'])
    expect(bodyOf(calls[1])).toEqual({ refreshToken: 'ref' })
    expect(auth(calls[2])).toBe('Bearer nuevo')
    expect(JSON.parse(sessionStorage.getItem('auth:tokens')!)).toEqual({ accessToken: 'nuevo', refreshToken: 'ref2' })
  })

  it('si el refresh no trae refresh token nuevo, conserva el anterior', async () => {
    loggedIn('viejo')
    const { http } = fakeHttp((config) =>
      config.url === '/v1/auth/refresh'
        ? { status: 200, data: { accessToken: 'nuevo' } }
        : auth(config) === 'Bearer nuevo'
          ? { status: 200 }
          : { status: 401 },
    )
    await http.get('/x')
    expect(JSON.parse(sessionStorage.getItem('auth:tokens')!)).toEqual({ accessToken: 'nuevo', refreshToken: 'ref' })
  })

  it('si el refresh falla, cierra la sesión y avisa', async () => {
    loggedIn('viejo')
    const expired = vi.fn()
    window.addEventListener(SESSION_EXPIRED_EVENT, expired)
    const { http } = replyWith(401)

    await expect(http.get('/x')).rejects.toMatchObject({ status: 401, message: SESSION_EXPIRED_MESSAGE })

    expect(sessionStorage.getItem('auth:user')).toBeNull()
    expect(expired).toHaveBeenCalledTimes(1)
    window.removeEventListener(SESSION_EXPIRED_EVENT, expired)
  })

  it('si tras renovar la petición sigue en 401, no entra en bucle: cierra la sesión', async () => {
    loggedIn('viejo')
    const { http, calls } = fakeHttp((config) =>
      config.url === '/v1/auth/refresh' ? { status: 200, data: { accessToken: 'nuevo' } } : { status: 401 },
    )
    await expect(http.get('/x')).rejects.toMatchObject({ status: 401 })
    expect(calls.map((c) => c.url)).toEqual(['/x', '/v1/auth/refresh', '/x'])
    expect(sessionStorage.getItem('auth:user')).toBeNull()
  })

  it('sin refresh token no intenta renovar: cierra la sesión directo', async () => {
    writeSession({ user: { username: 'a', name: 'A' }, accessToken: 'acc' })
    const { http, calls } = replyWith(401)
    await expect(http.get('/x')).rejects.toBeInstanceOf(ApiError)
    expect(calls.map((c) => c.url)).toEqual(['/x'])
  })

  it('varias peticiones con 401 a la vez comparten un solo refresh', async () => {
    loggedIn('viejo')
    const { http, calls } = fakeHttp(async (config) => {
      if (config.url === '/v1/auth/refresh') {
        await new Promise((r) => setTimeout(r, 10))
        return { status: 200, data: { accessToken: 'nuevo' } }
      }
      return auth(config) === 'Bearer nuevo' ? { status: 200, data: config.url } : { status: 401 }
    })

    const results = await Promise.all([http.get('/a'), http.get('/b'), http.get('/c')])

    expect(results.map((r) => r.data)).toEqual(['/a', '/b', '/c'])
    expect(calls.filter((c) => c.url === '/v1/auth/refresh')).toHaveLength(1)
  })

  it('con skipAuthRefresh un 401 no toca la sesión', async () => {
    loggedIn()
    const { http, calls } = replyWith(401)

    await expect(http.post('/v1/auth/login', {}, { skipAuthRefresh: true })).rejects.toMatchObject({ status: 401 })

    expect(calls).toHaveLength(1)
    expect(sessionStorage.getItem('auth:user')).not.toBeNull()
  })

  it('usa el mensaje de la API cuando viene, o uno genérico con el status', async () => {
    const { http } = fakeHttp((config) =>
      config.url === '/con' ? { status: 422, data: { message: 'Falta el campo q' } } : { status: 500 },
    )
    await expect(http.get('/con')).rejects.toMatchObject({ status: 422, message: 'Falta el campo q' })
    await expect(http.get('/sin')).rejects.toMatchObject({ status: 500, message: 'Error 500 al llamar a /sin' })
  })

  it('sin respuesta del servidor da un error de red con status 0', async () => {
    const { http } = replyWith(NETWORK_DOWN)
    await expect(http.get('/x')).rejects.toMatchObject({ status: 0, message: NETWORK_ERROR_MESSAGE })
  })

  it('los errores que no son de axios pasan tal cual', async () => {
    const http = createHttp('https://api.test', {
      adapter: async () => {
        throw new TypeError('rarísimo')
      },
    })
    await expect(http.get('/x')).rejects.toThrow(TypeError)
  })
})

describe('errorMessage', () => {
  it('usa el mensaje del error o el fallback', () => {
    expect(errorMessage(new Error('Se rompió'))).toBe('Se rompió')
    expect(errorMessage('x', 'Fallback')).toBe('Fallback')
    expect(errorMessage(new Error(''))).toBe('Algo salió mal.')
  })
})
