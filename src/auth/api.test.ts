import { describe, expect, it } from 'vitest'
import { bodyOf, fakeHttp, replyWith } from '../test/fakeHttp'
import { ApiAuth } from './api'

describe('ApiAuth', () => {
  it('login válido devuelve usuario y tokens', async () => {
    const { http, calls } = replyWith(200, {
      accessToken: 'acc',
      refreshToken: 'ref',
      user: { id: 'u1', email: 'cliente@test.local', fullName: 'Gabriel Kriger' },
    })

    const session = await new ApiAuth(http).login('  cliente@test.local ', 'secreto')

    expect(session).toEqual({
      user: { username: 'cliente@test.local', name: 'Gabriel Kriger' },
      accessToken: 'acc',
      refreshToken: 'ref',
    })
    expect(calls[0].method).toBe('post')
    expect(calls[0].url).toBe('/v1/auth/login')
    expect(bodyOf(calls[0])).toEqual({ email: 'cliente@test.local', password: 'secreto' })
  })

  it('credenciales incorrectas devuelven null sin tocar la sesión; otros errores lanzan', async () => {
    sessionStorage.setItem('auth:user', JSON.stringify({ username: 'otro', name: 'Otro' }))
    expect(await new ApiAuth(replyWith(401).http).login('a', 'b')).toBeNull()
    expect(await new ApiAuth(replyWith(400).http).login('a', 'b')).toBeNull()
    expect(sessionStorage.getItem('auth:user')).not.toBeNull()

    await expect(new ApiAuth(replyWith(503).http).login('a', 'b')).rejects.toThrow(/503/)
  })

  it('logout revoca el refresh token y no lanza si la API falla', async () => {
    const { http, calls } = replyWith(204)
    await new ApiAuth(http).logout('ref')
    expect(calls[0].url).toBe('/v1/auth/logout')
    expect(bodyOf(calls[0])).toEqual({ refreshToken: 'ref' })

    await expect(new ApiAuth(fakeHttp(() => ({ status: -1 })).http).logout('ref')).resolves.toBeUndefined()

    await new ApiAuth(http).logout(undefined)
    expect(calls).toHaveLength(1)
  })
})
