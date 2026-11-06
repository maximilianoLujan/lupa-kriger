import { expireSession, readAccessToken } from '../../../auth/session'
import type {
  AlternativeArticle,
  CompatibleModel,
  ProductBox,
  SearchParams,
  SearchResponse,
  Warehouse,
} from '../../../types/article'
import { DEFAULT_PAGE_SIZE, type ArticlesRepository } from '../repository'

/** Lo que devuelve la API del ERP (módulo Lupa). Se traduce a los tipos de la app acá, y solo acá. */
interface ApiCompatibleModel {
  make: string
  model: string
  yearFrom: number | null
  yearTo: number | null
}
interface ApiAlternative {
  code: string
  name: string
  brandName: string | null
  oemCodes: string[]
  price: string | null
  stock: Record<string, string>
}
interface ApiBox {
  code: string
  name: string
  details: string[]
  compatibleModels: ApiCompatibleModel[]
  alternatives: ApiAlternative[]
}
interface ApiSearchResponse {
  items: ApiBox[]
  page: number
  pageSize: number
  hasMore: boolean
  total: number
}
interface ApiWarehouse {
  code: string
  name: string
}

/**
 * Fuente real de datos: la API del ERP, con la sesión del usuario (Bearer).
 *
 *   GET {baseUrl}/v1/lupa/articles/search?q=&page=&pageSize=  → { items, page, pageSize, hasMore, total }
 *   GET {baseUrl}/v1/lupa/warehouses                           → { items: [{ code, name }] }
 */
export class ApiArticlesRepository implements ArticlesRepository {
  private readonly baseUrl: string
  private readonly fetchFn: typeof fetch
  private readonly getToken: () => string | null

  constructor(baseUrl: string, fetchFn: typeof fetch = fetch, getToken: () => string | null = readAccessToken) {
    if (!baseUrl) throw new Error('ApiArticlesRepository necesita una URL base (VITE_API_URL)')
    this.baseUrl = baseUrl
    this.fetchFn = fetchFn
    this.getToken = getToken
  }

  async search({ query, page, pageSize = DEFAULT_PAGE_SIZE }: SearchParams): Promise<SearchResponse> {
    const params = new URLSearchParams({ q: query, page: String(page), pageSize: String(pageSize) })
    const res = await this.get<ApiSearchResponse>(`/v1/lupa/articles/search?${params}`)
    return { data: res.items.map(toProductBox), page: res.page, hasMore: res.hasMore, total: res.total }
  }

  async getWarehouses(): Promise<Warehouse[]> {
    const res = await this.get<{ items: ApiWarehouse[] }>('/v1/lupa/warehouses')
    return res.items.map((w) => ({ code: w.code, shortName: w.code, name: w.name }))
  }

  private async get<T>(path: string): Promise<T> {
    const token = this.getToken()
    const response = await this.fetchFn(`${this.baseUrl}${path}`, {
      headers: { Accept: 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    })
    if (response.status === 401) {
      expireSession()
      throw new Error('Tu sesión venció. Volvé a ingresar.')
    }
    if (!response.ok) {
      throw new Error(`Error ${response.status} al llamar a ${path}`)
    }
    return response.json() as Promise<T>
  }
}

function toProductBox(box: ApiBox): ProductBox {
  return {
    articleCode: box.code,
    description: box.name,
    details: box.details,
    compatibleModels: box.compatibleModels.map(toCompatibleModel),
    alternatives: box.alternatives.map(toAlternative),
  }
}

function toCompatibleModel(m: ApiCompatibleModel): CompatibleModel {
  return {
    brandName: m.make,
    model: m.model,
    ...(m.yearFrom != null ? { since: String(m.yearFrom) } : {}),
    ...(m.yearTo != null ? { until: String(m.yearTo) } : {}),
  }
}

function toAlternative(a: ApiAlternative): AlternativeArticle {
  return {
    articleCode: a.code,
    particularCode: a.code,
    description: a.name,
    brandCode: a.brandName ?? '',
    brandName: a.brandName ?? '',
    priceList: a.price == null ? 0 : Number(a.price),
    stock: Object.fromEntries(Object.entries(a.stock).map(([code, qty]) => [code, Number(qty)])),
  }
}
