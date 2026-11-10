import { QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import type { ArticlesRepository } from '../data/articles'
import { createTestQueryClient } from '../test/queryClient'
import type { Order, OrdersResponse } from '../types/order'
import { useOrdersHistory } from './useOrdersHistory'

function order(id: string): Order {
  return { id, number: id, createdAt: '2026-01-01T00:00:00Z', status: 'completed', items: [], total: 0 }
}

function repoWith(getOrders: ArticlesRepository['getOrders']): ArticlesRepository {
  return { search: vi.fn(), getWarehouses: vi.fn(), getOrders, createOrder: vi.fn() }
}

function page(data: Order[], pageNumber: number, hasMore: boolean, total: number): OrdersResponse {
  return { data, page: pageNumber, hasMore, total }
}

function wrapper() {
  const client = createTestQueryClient()
  return ({ children }: { children: ReactNode }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

describe('useOrdersHistory', () => {
  it('carga la primera página al montar', async () => {
    const repo = repoWith(async () => page([order('a')], 1, false, 1))
    const { result } = renderHook(() => useOrdersHistory(repo), { wrapper: wrapper() })

    expect(result.current.loading).toBe(true)
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.orders.map((o) => o.id)).toEqual(['a'])
    expect(result.current.total).toBe(1)
    expect(result.current.hasMore).toBe(false)
  })

  it('loadMore acumula la página siguiente y no pide de más', async () => {
    const getOrders = vi.fn(async ({ page: p }: { page: number }) =>
      p === 1 ? page([order('a')], 1, true, 2) : page([order('b')], 2, false, 2),
    )
    const repo = repoWith(getOrders)
    const { result } = renderHook(() => useOrdersHistory(repo), { wrapper: wrapper() })
    await waitFor(() => expect(result.current.hasMore).toBe(true))

    act(() => result.current.loadMore())
    await waitFor(() => expect(result.current.orders).toHaveLength(2))
    expect(result.current.orders.map((o) => o.id)).toEqual(['a', 'b'])
    expect(result.current.hasMore).toBe(false)
    expect(getOrders).toHaveBeenLastCalledWith({ page: 2 })

    act(() => result.current.loadMore()) // sin más páginas
    expect(getOrders).toHaveBeenCalledTimes(2)
  })

  it('expone el error y permite reintentar', async () => {
    let fail = true
    const repo = repoWith(async () => {
      if (fail) throw new Error('Se cayó la API')
      return page([order('a')], 1, false, 1)
    })
    const { result } = renderHook(() => useOrdersHistory(repo), { wrapper: wrapper() })
    await waitFor(() => expect(result.current.error).toBe('Se cayó la API'))
    expect(result.current.orders).toEqual([])

    fail = false
    act(() => result.current.retry())
    await waitFor(() => expect(result.current.orders).toHaveLength(1))
    expect(result.current.error).toBeNull()
  })

  it('un error sin mensaje muestra el genérico', async () => {
    const repo = repoWith(async () => {
      throw new Error('')
    })
    const { result } = renderHook(() => useOrdersHistory(repo), { wrapper: wrapper() })
    await waitFor(() => expect(result.current.error).toBe('No se pudieron cargar tus pedidos.'))
  })
})
