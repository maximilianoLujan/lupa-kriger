import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import type { ApiAuth } from './api'
import { AuthProvider } from './AuthProvider'
import { expireSession, readAccessToken } from './session'
import { useAuth } from './useAuth'

describe('AuthProvider', () => {
  it('arranca sin usuario', () => {
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider })
    expect(result.current.user).toBeNull()
  })

  it('login válido setea el usuario y lo persiste en sessionStorage', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider })

    let ok = false
    await act(async () => {
      ok = await result.current.login('123', '123')
    })

    expect(ok).toBe(true)
    expect(result.current.user?.username).toBe('123')
    expect(JSON.parse(sessionStorage.getItem('auth:user')!)).toMatchObject({ username: '123' })
  })

  it('login inválido no setea usuario', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider })

    let ok = true
    await act(async () => {
      ok = await result.current.login('123', 'mal')
    })

    expect(ok).toBe(false)
    expect(result.current.user).toBeNull()
    expect(sessionStorage.getItem('auth:user')).toBeNull()
  })

  it('logout limpia usuario y storage', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider })
    await act(async () => {
      await result.current.login('123', '123')
    })

    act(() => result.current.logout())

    expect(result.current.user).toBeNull()
    expect(sessionStorage.getItem('auth:user')).toBeNull()
  })

  it('restaura la sesión guardada al montar', () => {
    sessionStorage.setItem('auth:user', JSON.stringify({ username: '123', name: 'Gabriel' }))
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider })
    expect(result.current.user?.name).toBe('Gabriel')
  })

  it('ignora un valor corrupto en storage', () => {
    sessionStorage.setItem('auth:user', '{no es json')
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider })
    expect(result.current.user).toBeNull()
  })

  it('useAuth falla fuera del provider', () => {
    expect(() => renderHook(() => useAuth())).toThrow(/AuthProvider/)
  })

  describe('con la API', () => {
    const session = { user: { username: 'c@test.local', name: 'Cliente' }, accessToken: 'acc', refreshToken: 'ref' }
    const apiAuth = { login: vi.fn(), logout: vi.fn(async () => {}) }
    const wrapper = ({ children }: { children: ReactNode }) => (
      <AuthProvider apiAuth={apiAuth as unknown as ApiAuth}>{children}</AuthProvider>
    )

    it('login guarda usuario y tokens; logout los borra y revoca el refresh token', async () => {
      apiAuth.login.mockResolvedValueOnce(session)
      const { result } = renderHook(() => useAuth(), { wrapper })

      await act(async () => {
        await result.current.login('c@test.local', 'secreto')
      })
      expect(result.current.user?.name).toBe('Cliente')
      expect(readAccessToken()).toBe('acc')

      act(() => result.current.logout())
      expect(result.current.user).toBeNull()
      expect(readAccessToken()).toBeNull()
      expect(apiAuth.logout).toHaveBeenCalledWith('ref')
    })

    it('login rechazado no setea usuario', async () => {
      apiAuth.login.mockResolvedValueOnce(null)
      const { result } = renderHook(() => useAuth(), { wrapper })
      let ok = true
      await act(async () => {
        ok = await result.current.login('c@test.local', 'mal')
      })
      expect(ok).toBe(false)
      expect(result.current.user).toBeNull()
    })

    it('si la API rechaza la sesión, vuelve al login', async () => {
      sessionStorage.setItem('auth:user', JSON.stringify(session.user))
      const { result } = renderHook(() => useAuth(), { wrapper })
      expect(result.current.user).not.toBeNull()
      act(() => expireSession())
      expect(result.current.user).toBeNull()
    })
  })
})
