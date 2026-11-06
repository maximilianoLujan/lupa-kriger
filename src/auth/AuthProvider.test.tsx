import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { AuthProvider } from './AuthProvider'
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
})
