import type {
  AlternativeArticle,
  ArticleDetail,
  DetailArticle,
  ProductBox,
  SearchParams,
  SearchResponse,
  Warehouse,
} from '../../../types/article'
import type { CreateOrderInput, Order, OrderItem, OrdersResponse, PageParams } from '../../../types/order'
import { normalizeText, searchWords } from '../../../utils/text'
import { DEFAULT_PAGE_SIZE, type ArticlesRepository } from '../repository'
import { MOCK_ARTICLES } from './articles.mock'
import { findMockCustomer } from './customers.mock'
import { MOCK_ORDERS, orderTitle } from './orders.mock'
import { MOCK_WAREHOUSES } from './warehouses.mock'

interface MockOptions {
  articles?: ProductBox[]
  warehouses?: Warehouse[]
  orders?: Order[]
  /** Demora simulada en ms. 0 en tests. */
  delayMs?: number
}

/** Todo el texto buscable de una cajita, ya normalizado. */
function searchableText(box: ProductBox): string {
  const parts = [
    box.description,
    ...box.details,
    ...box.compatibleModels.map((m) => `${m.brandName} ${m.model}`),
    ...box.alternatives.flatMap((a) => [a.brandName, a.particularCode, a.description]),
  ]
  return normalizeText(parts.join(' '))
}

/** Solo letras y números: así "w712" encuentra el código "W 712/75". */
const codeOnly = (value: string) => normalizeText(value).replace(/[^a-z0-9]/g, '')

/**
 * "Comienza con", como la API: la descripción (de la cajita o de un equivalente) empieza con la primera palabra
 * buscada y tiene las demás en cualquier lugar, o el código de un equivalente empieza con lo buscado sin contar
 * guiones ni espacios.
 */
function startsWithQuery(box: ProductBox, query: string): boolean {
  const [first, ...rest] = searchWords(query)
  const code = codeOnly(query)
  const descriptions = [box.description, ...box.alternatives.map((a) => a.description)].map(normalizeText)
  return (
    descriptions.some((d) => d.startsWith(first) && rest.every((word) => d.includes(word))) ||
    (code.length > 0 && box.alternatives.some((a) => codeOnly(a.particularCode).startsWith(code)))
  )
}

/** En el mock no hay costos: se inventa uno estable a partir del precio (margen del 60 % sobre el costo). */
const MOCK_VAT = 1.21
const MOCK_MARKUP_PCT = 60
const round2 = (value: number) => Math.round(value * 100) / 100

function toDetailArticle(box: ProductBox, article: AlternativeArticle): DetailArticle {
  const priceNet = round2(article.priceList / MOCK_VAT)
  const cost = round2(priceNet / (1 + MOCK_MARKUP_PCT / 100))
  return {
    ...article,
    details: box.details,
    categoryName: 'Repuestos',
    compatibleModels: box.compatibleModels,
    oemCodes: [],
    priceNet,
    cost,
    costUpdatedAt: article.priceUpdatedAt ?? new Date().toISOString(),
    markupPct: MOCK_MARKUP_PCT,
    marginPct: round2(((priceNet - cost) / priceNet) * 100),
  }
}

const hasStock = (article: AlternativeArticle) => Object.values(article.stock).some((quantity) => quantity > 0)

export class MockArticlesRepository implements ArticlesRepository {
  private readonly articles: ProductBox[]
  private readonly warehouses: Warehouse[]
  /** Copia propia: los pedidos enviados se suman acá y no tocan la constante compartida. */
  private readonly orders: Order[]
  private readonly delayMs: number

  constructor({
    articles = MOCK_ARTICLES,
    warehouses = MOCK_WAREHOUSES,
    orders = MOCK_ORDERS,
    delayMs = 300,
  }: MockOptions = {}) {
    this.articles = articles
    this.warehouses = warehouses
    this.orders = [...orders]
    this.delayMs = delayMs
  }

  async search({
    query,
    page,
    pageSize = DEFAULT_PAGE_SIZE,
    inStock = false,
    startsWith = false,
  }: SearchParams): Promise<SearchResponse> {
    await this.wait()

    const tokens = searchWords(query)
    const found = !tokens.length
      ? this.articles
      : startsWith
        ? this.articles.filter((box) => startsWithQuery(box, query))
        : this.articles.filter((box) => {
            const text = searchableText(box)
            return tokens.every((t) => text.includes(t))
          })
    // Solo con stock: cada cajita queda con los equivalentes que tienen, y la que se queda sin ninguno no sale.
    const matches = inStock
      ? found
          .map((box) => ({ ...box, alternatives: box.alternatives.filter(hasStock) }))
          .filter((box) => box.alternatives.length > 0)
      : found

    const safePage = Math.max(1, page)
    const start = (safePage - 1) * pageSize
    const data = matches.slice(start, start + pageSize)

    return {
      data,
      page: safePage,
      hasMore: start + pageSize < matches.length,
      total: matches.length,
    }
  }

  /** La cajita que tiene ese código (el de la cabecera o el de un equivalente), con el pedido primero. */
  async getArticle(code: string): Promise<ArticleDetail> {
    await this.wait()

    const wanted = code.trim().toLowerCase()
    const matches = (value: string) => value.trim().toLowerCase() === wanted
    const box =
      this.articles.find((b) => b.alternatives.some((a) => matches(a.particularCode))) ??
      this.articles.find((b) => matches(b.articleCode))
    if (!box) throw new Error('No encontramos un artículo con ese código')

    const requested = box.alternatives.find((a) => matches(a.particularCode))
    const ordered = requested ? [requested, ...box.alternatives.filter((a) => a !== requested)] : box.alternatives
    return {
      ...box,
      articleCode: requested?.particularCode ?? box.articleCode,
      groupName: box.description,
      alternatives: ordered.map((a) => toDetailArticle(box, a)),
    }
  }

  async getWarehouses(): Promise<Warehouse[]> {
    await this.wait()
    return this.warehouses
  }

  async getOrders({ page, pageSize = DEFAULT_PAGE_SIZE }: PageParams): Promise<OrdersResponse> {
    await this.wait()

    const sorted = [...this.orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    const safePage = Math.max(1, page)
    const start = (safePage - 1) * pageSize

    return {
      data: sorted.slice(start, start + pageSize),
      page: safePage,
      hasMore: start + pageSize < sorted.length,
      total: sorted.length,
    }
  }

  /**
   * Arma la nota de pedido con los precios actuales del mock y la suma al historial, como haría la API: entra
   * pendiente de confirmación y sin número (la empresa la numera al emitirla).
   */
  async createOrder(input: CreateOrderInput): Promise<Order> {
    await this.wait()

    if (!findMockCustomer(input.customerCode)) {
      throw new Error(`No encontramos un cliente con el número ${input.customerCode.trim()}. Revisalo o consultá a la empresa.`)
    }

    const alternatives = this.articles.flatMap((box) => box.alternatives)
    const unavailable = [
      ...new Set(input.items.map((i) => i.code).filter((code) => !alternatives.some((a) => a.particularCode === code))),
    ]
    if (unavailable.length) throw new Error(`Estos artículos ya no están disponibles: ${unavailable.join(', ')}`)

    const items: OrderItem[] = input.items.map(({ code, quantity }) => {
      const article = alternatives.find((a) => a.particularCode === code)!
      return {
        articleCode: article.articleCode,
        particularCode: article.particularCode,
        brandName: article.brandName,
        description: article.description,
        quantity,
        unitPrice: article.priceList,
        total: article.priceList * quantity,
      }
    })
    const number = Math.max(0, ...this.orders.map((o) => Number(o.id) || 0)) + 1
    const order: Order = {
      id: String(number),
      number: orderTitle(null),
      createdAt: new Date().toISOString(),
      status: 'pending',
      items,
      total: items.reduce((sum, i) => sum + i.total, 0),
    }
    this.orders.push(order)
    return order
  }

  private wait() {
    return this.delayMs > 0 ? new Promise((r) => setTimeout(r, this.delayMs)) : Promise.resolve()
  }
}
