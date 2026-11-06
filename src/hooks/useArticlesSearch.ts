import { useCallback, useEffect, useState } from 'react'
import type { ArticlesRepository } from '../data/articles'
import type { ProductBox } from '../types/article'

interface State {
  items: ProductBox[]
  page: number
  hasMore: boolean
  total: number
  /** Query cuya primera página ya está cargada. `null` mientras se busca. */
  loadedQuery: string | null
  loadingMore: boolean
  error: string | null
}

const INITIAL: State = {
  items: [],
  page: 0,
  hasMore: false,
  total: 0,
  loadedQuery: null,
  loadingMore: false,
  error: null,
}

function toMessage(err: unknown) {
  return err instanceof Error ? err.message : 'No se pudo cargar el catálogo.'
}

/**
 * Busca artículos en el repositorio y acumula páginas.
 * Cada cambio de `query` reinicia el listado; `loadMore` trae la siguiente página.
 */
export function useArticlesSearch(repository: ArticlesRepository, query: string) {
  const [state, setState] = useState<State>(INITIAL)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let cancelled = false
    repository
      .search({ query, page: 1 })
      .then((res) => {
        if (cancelled) return
        setState({
          items: res.data,
          page: res.page,
          hasMore: res.hasMore,
          total: res.total,
          loadedQuery: query,
          loadingMore: false,
          error: null,
        })
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setState({ ...INITIAL, loadedQuery: query, error: toMessage(err) })
      })
    return () => {
      cancelled = true
    }
  }, [repository, query, attempt])

  const loading = state.loadedQuery !== query || state.loadingMore

  const loadMore = useCallback(() => {
    if (loading || !state.hasMore) return
    setState((s) => ({ ...s, loadingMore: true, error: null }))
    repository
      .search({ query, page: state.page + 1 })
      .then((res) => {
        setState((s) => ({
          ...s,
          items: [...s.items, ...res.data],
          page: res.page,
          hasMore: res.hasMore,
          total: res.total,
          loadingMore: false,
        }))
      })
      .catch((err: unknown) => {
        setState((s) => ({ ...s, loadingMore: false, error: toMessage(err) }))
      })
  }, [repository, query, loading, state.hasMore, state.page])

  const retry = useCallback(() => {
    setState((s) => ({ ...s, loadedQuery: null, error: null }))
    setAttempt((n) => n + 1)
  }, [])

  return {
    items: state.items,
    total: state.total,
    hasMore: state.hasMore,
    error: state.error,
    loading,
    loadMore,
    retry,
  }
}
