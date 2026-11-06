import { describe, expect, it } from 'vitest'
import { ApiError } from './http'
import { createQueryClient } from './queryClient'

function retryOf(client: ReturnType<typeof createQueryClient>) {
  const retry = client.getDefaultOptions().queries?.retry
  if (typeof retry !== 'function') throw new Error('retry debería ser una función')
  return retry
}

describe('createQueryClient', () => {
  it('reintenta una vez los errores de red o del servidor', () => {
    const retry = retryOf(createQueryClient())
    expect(retry(0, new ApiError(0, 'red'))).toBe(true)
    expect(retry(1, new ApiError(0, 'red'))).toBe(false)
    expect(retry(0, new ApiError(503, 'caído'))).toBe(true)
  })

  it('no reintenta sesión vencida ni errores del cliente', () => {
    const retry = retryOf(createQueryClient())
    expect(retry(0, new ApiError(401, 'sesión'))).toBe(false)
    expect(retry(0, new ApiError(404, 'no existe'))).toBe(false)
  })

  it('no refresca al volver a la pestaña', () => {
    expect(createQueryClient().getDefaultOptions().queries?.refetchOnWindowFocus).toBe(false)
  })
})
