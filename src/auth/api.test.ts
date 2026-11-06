import { describe, expect, it, vi } from 'vitest'
import { ApiAuth } from './api'

function fakeFetch(body: unknown, status = 200) {
  return vi.fn(async () => ({ ok: status < 300, status, json: async () => body })) as unknown as typeof fetch
}

describe('ApiAuth', () => {
  it('exige una URL base', () => {
    expect(() => new ApiAuth('')).toThrow(/VITE_API_URL/)
  })

  it('login válido devuelve usuario y tokens', async () => {
    const fetchFn = fakeFetch({
      accessToken: 'acc',
      refreshToken: 'ref',
      user: { id: 'u1', email: 'cliente@test.local', fullName: 'Gabriel Kriger' },
    })
    const session = await new ApiAuth('https://api.test', fetchFn).login('  cliente@test.local ', 'secreto')

    expect(session).toEqual({
      user: { username: 'cliente@test.local', name: 'Gabriel Kriger' },
      accessToken: 'acc',
      refreshToken: 'ref',
    })
    expect(fetchFn).toHaveBeenCalledWith(
      'https://api.test/v1/auth/login',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ email: 'cliente@test.local', password: 'secreto' }),
      }),
    )
  })

  it('credenciales incorrectas devuelven null; otros errores lanzan', async () => {
    expect(await new ApiAuth('https://api.test', fakeFetch(null, 401)).login('a', 'b')).toBeNull()
    await expect(new ApiAuth('https://api.test', fakeFetch(null, 503)).login('a', 'b')).rejects.toThrow(/503/)
  })

  it('logout revoca el refresh token y no lanza si la API falla', async () => {
    const fetchFn = fakeFetch(null, 204)
    await new ApiAuth('https://api.test', fetchFn).logout('ref')
    expect(fetchFn).toHaveBeenCalledWith(
      'https://api.test/v1/auth/logout',
      expect.objectContaining({ method: 'POST', body: JSON.stringify({ refreshToken: 'ref' }) }),
    )

    const failing = vi.fn(async () => {
      throw new Error('red')
    }) as unknown as typeof fetch
    await expect(new ApiAuth('https://api.test', failing).logout('ref')).resolves.toBeUndefined()
    await new ApiAuth('https://api.test', fetchFn).logout(undefined)
    expect(fetchFn).toHaveBeenCalledTimes(1)
  })
})
