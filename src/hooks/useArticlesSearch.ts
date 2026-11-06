import { useInfiniteQuery } from '@tanstack/react-query'
import { useCallback } from 'react'
import type { ArticlesRepository } from '../data/articles'
import { errorMessage } from '../lib/http'
import { queryKeys } from './queryKeys'

/**
 * Busca artículos en el repositorio y acumula páginas con TanStack Query.
 * Cada `query` distinta es una consulta aparte (y queda cacheada); `loadMore` trae la siguiente página.
 */
export function useArticlesSearch(repository: ArticlesRepository, query: string) {
  const result = useInfiniteQuery({
    queryKey: queryKeys.articles.search(query),
    queryFn: ({ pageParam }) => repository.search({ query, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.hasMore ? last.page + 1 : undefined),
  })

  const { hasNextPage, isFetchingNextPage, fetchNextPage, refetch } = result

  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) void fetchNextPage()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  const retry = useCallback(() => void refetch(), [refetch])

  const pages = result.data?.pages ?? []

  return {
    items: pages.flatMap((p) => p.data),
    total: pages.at(-1)?.total ?? 0,
    hasMore: hasNextPage,
    loading: result.isPending || isFetchingNextPage,
    error: result.error ? errorMessage(result.error, 'No se pudo cargar el catálogo.') : null,
    loadMore,
    retry,
  }
}
