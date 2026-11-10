import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import type { ArticlesRepository } from '../data/articles'
import { createTestQueryClient } from '../test/queryClient'
import type { Order } from '../types/order'
import { queryKeys } from './queryKeys'
import { useCreateOrder } from './useCreateOrder'

const created: Order = { id: '1', number: 'Nota de pedido 00000001', createdAt: '2026-11-10T10:00:00Z', status: 'pending', items: [], total: 0 }

function repoWith(createOrder: ArticlesRepository['createOrder']): ArticlesRepository {
  return { search: vi.fn(), getWarehouses: vi.fn(), getOrders: vi.fn(), createOrder }
}

function wrapper(client: QueryClient) {
  return ({ children }: { children: ReactNode }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

describe('useCreateOrder', () => {
  it('manda el pedido al repositorio y al confirmarse invalida el historial', async () => {
    const client = createTestQueryClient()
    const invalidate = vi.spyOn(client, 'invalidateQueries')
    const createOrder = vi.fn(async () => created)
    const { result } = renderHook(() => useCreateOrder(repoWith(createOrder)), { wrapper: wrapper(client) })

    act(() => result.current.mutate({ items: [{ code: 'FR-1024', quantity: 2 }] }))
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(createOrder).toHaveBeenCalledWith({ items: [{ code: 'FR-1024', quantity: 2 }] })
    expect(result.current.data).toEqual(created)
    expect(invalidate).toHaveBeenCalledWith({ queryKey: queryKeys.orders.all })
  })

  it('expone el error del repositorio sin invalidar nada', async () => {
    const client = createTestQueryClient()
    const invalidate = vi.spyOn(client, 'invalidateQueries')
    const repo = repoWith(async () => {
      throw new Error('Sin conexión')
    })
    const { result } = renderHook(() => useCreateOrder(repo), { wrapper: wrapper(client) })

    act(() => result.current.mutate({ items: [{ code: 'FR-1024', quantity: 1 }] }))
    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error?.message).toBe('Sin conexión')
    expect(invalidate).not.toHaveBeenCalled()
  })
})
