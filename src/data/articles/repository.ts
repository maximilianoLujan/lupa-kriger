import type { SearchParams, SearchResponse, Warehouse } from '../../types/article'
import type { OrdersResponse, PageParams } from '../../types/order'

/**
 * Contrato que cumplen todas las fuentes de datos (artículos y pedidos).
 * La UI solo habla con esta interfaz; nunca sabe si atrás hay mock o API.
 */
export interface ArticlesRepository {
  search(params: SearchParams): Promise<SearchResponse>
  getWarehouses(): Promise<Warehouse[]>
  /** Historial de pedidos del cliente, del más nuevo al más viejo, paginado. */
  getOrders(params: PageParams): Promise<OrdersResponse>
}

export const DEFAULT_PAGE_SIZE = 10
