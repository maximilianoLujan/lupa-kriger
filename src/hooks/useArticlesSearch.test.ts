import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { ArticlesRepository } from '../data/articles'
import type { ProductBox, SearchResponse } from '../types/article'
import { useArticlesSearch } from './useArticlesSearch'

function box(code: string): ProductBox {
  return { articleCode: code, description: code, details: [code], compatibleModels: [], alternatives: [] }
}

function repoWith(search: ArticlesRepository['search']): ArticlesRepository {
  return { search, getWarehouses: async () => [] }
}

function page(data: ProductBox[], pageNumber: number, hasMore: boolean, total: number): SearchResponse {
  return { data, page: pageNumber, hasMore, total }
}

describe('useArticlesSearch', () => {
  it('carga la primera página al montar', async () => {
    const repo = repoWith(async () => page([box('a')], 1, false, 1))
    const { result } = renderHook(() => useArticlesSearch(repo, ''))

    expect(result.current.loading).toBe(true)
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.items.map((b) => b.articleCode)).toEqual(['a'])
    expect(result.current.total).toBe(1)
    expect(result.current.hasMore).toBe(false)
  })

  it('reinicia el listado cuando cambia la query', async () => {
    const search = vi.fn(async ({ query }: { query: string }) => page([box(query || 'todo')], 1, false, 1))
    const repo = repoWith(search)
    const { result, rerender } = renderHook(({ q }) => useArticlesSearch(repo, q), {
      initialProps: { q: '' },
    })
    await waitFor(() => expect(result.current.loading).toBe(false))

    rerender({ q: 'fiat' })
    expect(result.current.loading).toBe(true)
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.items.map((b) => b.articleCode)).toEqual(['fiat'])
    expect(search).toHaveBeenCalledTimes(2)
  })

  it('loadMore acumula la página siguiente', async () => {
    const search = vi.fn(async ({ page: p }: { page: number }) =>
      p === 1 ? page([box('a')], 1, true, 2) : page([box('b')], 2, false, 2),
    )
    const repo = repoWith(search)
    const { result } = renderHook(() => useArticlesSearch(repo, ''))
    await waitFor(() => expect(result.current.hasMore).toBe(true))

    act(() => result.current.loadMore())
    expect(result.current.loading).toBe(true)
    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.items.map((b) => b.articleCode)).toEqual(['a', 'b'])
    expect(result.current.hasMore).toBe(false)
    expect(search).toHaveBeenLastCalledWith({ query: '', page: 2 })
  })

  it('loadMore no hace nada si no hay más páginas o está cargando', async () => {
    const search = vi.fn(async () => page([box('a')], 1, false, 1))
    const repo = repoWith(search)
    const { result } = renderHook(() => useArticlesSearch(repo, ''))

    act(() => result.current.loadMore()) // todavía cargando
    await waitFor(() => expect(result.current.loading).toBe(false))
    act(() => result.current.loadMore()) // sin más páginas

    expect(search).toHaveBeenCalledTimes(1)
  })

  it('expone el error de la primera página y permite reintentar', async () => {
    let fail = true
    const repo = repoWith(async () => {
      if (fail) throw new Error('Se cayó la API')
      return page([box('a')], 1, false, 1)
    })
    const { result } = renderHook(() => useArticlesSearch(repo, ''))
    await waitFor(() => expect(result.current.error).toBe('Se cayó la API'))
    expect(result.current.loading).toBe(false)
    expect(result.current.items).toEqual([])

    fail = false
    act(() => result.current.retry())
    expect(result.current.loading).toBe(true)
    await waitFor(() => expect(result.current.items).toHaveLength(1))
    expect(result.current.error).toBeNull()
  })

  it('un error no-Error muestra mensaje genérico', async () => {
    const repo = repoWith(async () => {
      throw 'boom'
    })
    const { result } = renderHook(() => useArticlesSearch(repo, ''))
    await waitFor(() => expect(result.current.error).toBe('No se pudo cargar el catálogo.'))
  })

  it('un error al cargar más conserva lo ya cargado', async () => {
    const repo = repoWith(async ({ page: p }) => {
      if (p === 1) return page([box('a')], 1, true, 2)
      throw new Error('Falló la página 2')
    })
    const { result } = renderHook(() => useArticlesSearch(repo, ''))
    await waitFor(() => expect(result.current.hasMore).toBe(true))

    act(() => result.current.loadMore())
    await waitFor(() => expect(result.current.error).toBe('Falló la página 2'))
    expect(result.current.items).toHaveLength(1)
    expect(result.current.loading).toBe(false)
  })

  it('ignora respuestas de una query que ya cambió', async () => {
    const resolvers: Array<(r: SearchResponse) => void> = []
    const repo = repoWith(() => new Promise<SearchResponse>((resolve) => resolvers.push(resolve)))
    const { result, rerender } = renderHook(({ q }) => useArticlesSearch(repo, q), {
      initialProps: { q: 'vieja' },
    })
    rerender({ q: 'nueva' })

    // Responde primero la nueva, después la vieja: la vieja no debe pisar.
    await act(async () => resolvers[1](page([box('nueva')], 1, false, 1)))
    await act(async () => resolvers[0](page([box('vieja')], 1, false, 1)))

    expect(result.current.items.map((b) => b.articleCode)).toEqual(['nueva'])
    expect(result.current.loading).toBe(false)
  })
})
