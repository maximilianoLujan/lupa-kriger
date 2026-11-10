import { useInfiniteQuery } from '@tanstack/react-query'
import { useCallback } from 'react'
import type { ArticlesRepository } from '../data/articles'
import { errorMessage } from '../lib/http'
import { queryKeys } from './queryKeys'

/**
 * Historial de pedidos paginado con TanStack Query. `loadMore` trae la página siguiente
 * (lo dispara el scroll infinito de la pantalla del carrito).
 */
export function useOrdersHistory(repository: ArticlesRepository) {
  const result = useInfiniteQuery({
    queryKey: queryKeys.orders.history,
    queryFn: ({ pageParam }) => repository.getOrders({ page: pageParam }),
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
    orders: pages.flatMap((p) => p.data),
    total: pages.at(-1)?.total ?? 0,
    hasMore: hasNextPage,
    loading: result.isPending || isFetchingNextPage,
    error: result.error ? errorMessage(result.error, 'No se pudieron cargar tus pedidos.') : null,
    loadMore,
    retry,
  }
}
