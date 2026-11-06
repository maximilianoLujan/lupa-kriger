import type { SearchParams, SearchResponse, Warehouse } from '../../../types/article'
import { DEFAULT_PAGE_SIZE, type ArticlesRepository } from '../repository'

/**
 * Fuente real de datos. Todavía no hay backend: este es el contrato que la
 * API tiene que cumplir para que el front funcione sin cambios.
 *
 *   GET {baseUrl}/articles/search?q=&page=&pageSize=  → SearchResponse
 *   GET {baseUrl}/warehouses                           → Warehouse[]
 */
export class ApiArticlesRepository implements ArticlesRepository {
  private readonly baseUrl: string
  private readonly fetchFn: typeof fetch

  constructor(baseUrl: string, fetchFn: typeof fetch = fetch) {
    if (!baseUrl) throw new Error('ApiArticlesRepository necesita una URL base (VITE_API_URL)')
    this.baseUrl = baseUrl
    this.fetchFn = fetchFn
  }

  async search({ query, page, pageSize = DEFAULT_PAGE_SIZE }: SearchParams): Promise<SearchResponse> {
    const params = new URLSearchParams({ q: query, page: String(page), pageSize: String(pageSize) })
    return this.get<SearchResponse>(`/articles/search?${params}`)
  }

  getWarehouses(): Promise<Warehouse[]> {
    return this.get<Warehouse[]>('/warehouses')
  }

  private async get<T>(path: string): Promise<T> {
    const response = await this.fetchFn(`${this.baseUrl}${path}`, {
      headers: { Accept: 'application/json' },
    })
    if (!response.ok) {
      throw new Error(`Error ${response.status} al llamar a ${path}`)
    }
    return response.json() as Promise<T>
  }
}
