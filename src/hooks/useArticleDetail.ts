import { useQuery } from '@tanstack/react-query'
import type { ArticlesRepository } from '../data/articles'
import { errorMessage } from '../lib/http'
import { queryKeys } from './queryKeys'

/** Ficha de un artículo por su código. Cada código es una consulta aparte y queda cacheada. */
export function useArticleDetail(repository: ArticlesRepository, code: string) {
  const result = useQuery({
    queryKey: queryKeys.articles.detail(code),
    queryFn: () => repository.getArticle(code),
  })

  return {
    detail: result.data ?? null,
    loading: result.isPending,
    error: result.error ? errorMessage(result.error, 'No se pudo cargar la ficha del artículo.') : null,
    retry: () => void result.refetch(),
  }
}
