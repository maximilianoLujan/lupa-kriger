import { QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import type { ArticlesRepository } from '../data/articles'
import { createTestQueryClient } from '../test/queryClient'
import { useWarehouses } from './useWarehouses'

describe('useWarehouses', () => {
  it('arranca vacío, carga una vez y comparte el resultado entre componentes', async () => {
    const getWarehouses = vi.fn(async () => [{ code: 'GUA', shortName: 'GUA', name: 'Guatraché' }])
    const repo: ArticlesRepository = { search: vi.fn(), getWarehouses, getOrders: vi.fn() }
    const client = createTestQueryClient()
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    )

    const a = renderHook(() => useWarehouses(repo), { wrapper })
    const b = renderHook(() => useWarehouses(repo), { wrapper })
    expect(a.result.current).toEqual([])

    await waitFor(() => expect(a.result.current).toHaveLength(1))
    expect(b.result.current[0].name).toBe('Guatraché')
    expect(getWarehouses).toHaveBeenCalledTimes(1)
  })
})
