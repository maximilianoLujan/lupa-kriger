import type { AxiosInstance } from 'axios'
import type {
  AlternativeArticle,
  CompatibleModel,
  ProductBox,
  SearchParams,
  SearchResponse,
  Warehouse,
} from '../../../types/article'
import type { CreateOrderInput, Order, OrderItem, OrderStatus, OrdersResponse, PageParams } from '../../../types/order'
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
  /** Ubicación principal por código de depósito; vacío si el usuario no tiene el permiso para verla. */
  locations?: Record<string, string>
  photoUrl: string | null
}
interface ApiBox {
  code: string
  name: string
  details: string[]
  compatibleModels: ApiCompatibleModel[]
  alternatives: ApiAlternative[]
  /** Ruta firmada relativa a la API (`/v1/public/lupa/photos?token=…`), válida un día y sin sesión. */
  photoUrl: string | null
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
interface ApiOrderItem {
  code: string
  name: string
  brandName: string | null
  /** Cantidad decimal ("2.000"). */
  quantity: string
  /** Precio unitario final con IVA al momento del pedido. */
  unitPrice: string
  /** Importe del renglón con IVA y descuentos. */
  total: string
}
interface ApiOrder {
  id: string
  /** Título del comprobante: "Nota de pedido 00000007". */
  number: string
  createdAt: string
  /** pending (sin confirmar) | confirmed | preparing | partial | completed | cancelled. */
  status: string
  total: string
  items: ApiOrderItem[]
}
interface ApiOrdersResponse {
  items: ApiOrder[]
  page: number
  pageSize: number
  hasMore: boolean
  total: number
}

/**
 * Fuente real de datos: la API del ERP. El token, el refresh y los errores
 * los maneja el cliente HTTP (`src/lib/http.ts`); acá solo se traducen datos.
 *
 *   GET /v1/lupa/articles/search?q=&page=&pageSize=  → { items, page, pageSize, hasMore, total }
 *                                                        (`&inStock=true`: solo artículos con stock)
 *   GET /v1/lupa/warehouses                           → { items: [{ code, name }] }
 *   GET /v1/lupa/orders?page=&pageSize=               → { items, page, pageSize, hasMore, total }: las notas de pedido
 *                                                        de la ficha de cliente con el mail del usuario, de la más
 *                                                        nueva a la más vieja (lupaListOrders)
 *   POST /v1/lupa/orders { items: [{ code, quantity }], notes } → el pedido creado, con la misma forma que el
 *                                                        historial (lupaCreateOrder)
 *   GET /v1/public/lupa/photos?token=…&variant=thumb  → la foto (ruta firmada que viene en `photoUrl`; el navegador
 *                                                        la carga sin token de sesión)
 */
export class ApiArticlesRepository implements ArticlesRepository {
  private readonly http: AxiosInstance

  constructor(http: AxiosInstance) {
    this.http = http
  }

  async search({ query, page, pageSize = DEFAULT_PAGE_SIZE, inStock = false }: SearchParams): Promise<SearchResponse> {
    const { data } = await this.http.get<ApiSearchResponse>('/v1/lupa/articles/search', {
      params: { q: query, page, pageSize, ...(inStock ? { inStock: true } : {}) },
    })
    const baseUrl = this.http.defaults.baseURL ?? ''
    return {
      data: data.items.map((box) => toProductBox(box, baseUrl)),
      page: data.page,
      hasMore: data.hasMore,
      total: data.total,
    }
  }

  async getWarehouses(): Promise<Warehouse[]> {
    const { data } = await this.http.get<{ items: ApiWarehouse[] }>('/v1/lupa/warehouses')
    return data.items.map((w) => ({ code: w.code, shortName: w.code, name: w.name }))
  }

  async getOrders({ page, pageSize = DEFAULT_PAGE_SIZE }: PageParams): Promise<OrdersResponse> {
    const { data } = await this.http.get<ApiOrdersResponse>('/v1/lupa/orders', { params: { page, pageSize } })
    return {
      data: data.items.map(toOrder),
      page: data.page,
      hasMore: data.hasMore,
      total: data.total,
    }
  }

  async createOrder(input: CreateOrderInput): Promise<Order> {
    const { data } = await this.http.post<ApiOrder>('/v1/lupa/orders', {
      customerCode: input.customerCode.trim(),
      // La API recibe cantidades decimales como texto.
      items: input.items.map((i) => ({ code: i.code, quantity: String(i.quantity) })),
      ...(input.notes ? { notes: input.notes } : {}),
    })
    return toOrder(data)
  }
}

function toProductBox(box: ApiBox, baseUrl: string): ProductBox {
  const photoUrl = photoSrc(baseUrl, box.photoUrl)
  const photoThumbUrl = photoSrc(baseUrl, box.photoUrl, 'thumb')
  return {
    articleCode: box.code,
    description: box.name,
    details: box.details,
    compatibleModels: box.compatibleModels.map(toCompatibleModel),
    alternatives: box.alternatives.map(toAlternative),
    ...(photoUrl && photoThumbUrl ? { photoUrl, photoThumbUrl } : {}),
  }
}

/**
 * URL absoluta de la foto: la API devuelve la ruta relativa y firmada; se le suma la base. Con `variant: 'thumb'`
 * pide la miniatura (si el archivo no la tiene, la API manda la foto original).
 */
export function photoSrc(
  baseUrl: string,
  path: string | null | undefined,
  variant?: 'thumb',
): string | undefined {
  if (!path) return undefined
  const url = `${baseUrl.replace(/\/$/, '')}${path}`
  if (!variant) return url
  const separator = path.includes('?') ? '&' : '?'
  return `${url}${separator}variant=${variant}`
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
    ...(a.locations && Object.keys(a.locations).length > 0 ? { locations: a.locations } : {}),
  }
}

const ORDER_STATUSES: readonly OrderStatus[] = ['pending', 'confirmed', 'preparing', 'partial', 'completed', 'cancelled']

/** Un estado que la app no conoce se muestra como pendiente antes que romper la pantalla. */
function toOrderStatus(status: string): OrderStatus {
  const normalized = status.toLowerCase() as OrderStatus
  return ORDER_STATUSES.includes(normalized) ? normalized : 'pending'
}

function toOrderItem(item: ApiOrderItem): OrderItem {
  return {
    articleCode: item.code,
    particularCode: item.code,
    brandName: item.brandName ?? '',
    description: item.name,
    quantity: Number(item.quantity),
    unitPrice: Number(item.unitPrice),
    total: Number(item.total),
  }
}

function toOrder(order: ApiOrder): Order {
  return {
    id: order.id,
    number: order.number,
    createdAt: order.createdAt,
    status: toOrderStatus(order.status),
    items: order.items.map(toOrderItem),
    total: Number(order.total),
  }
}
