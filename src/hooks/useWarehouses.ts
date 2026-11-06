import { useQuery } from '@tanstack/react-query'
import type { ArticlesRepository } from '../data/articles'
import type { Warehouse } from '../types/article'
import { queryKeys } from './queryKeys'

const NONE: Warehouse[] = []

/** Depósitos con stock. Cambian casi nunca: se piden una vez por sesión. */
export function useWarehouses(repository: ArticlesRepository) {
  const { data } = useQuery({
    queryKey: queryKeys.warehouses,
    queryFn: () => repository.getWarehouses(),
    staleTime: Infinity,
  })
  return data ?? NONE
}
