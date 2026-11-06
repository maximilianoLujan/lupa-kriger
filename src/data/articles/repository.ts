import type { SearchParams, SearchResponse, Warehouse } from '../../types/article'

/**
 * Contrato que cumplen todas las fuentes de artículos.
 * La UI solo habla con esta interfaz; nunca sabe si atrás hay mock o API.
 */
export interface ArticlesRepository {
  search(params: SearchParams): Promise<SearchResponse>
  getWarehouses(): Promise<Warehouse[]>
}

export const DEFAULT_PAGE_SIZE = 10
