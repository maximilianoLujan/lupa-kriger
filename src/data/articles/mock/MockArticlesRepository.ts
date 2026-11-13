import type { AlternativeArticle, ProductBox, SearchParams, SearchResponse, Warehouse } from '../../../types/article'
import type { CreateOrderInput, Order, OrderItem, OrdersResponse, PageParams } from '../../../types/order'
import { normalizeText, tokenize } from '../../../utils/text'
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

  async search({ query, page, pageSize = DEFAULT_PAGE_SIZE, inStock = false }: SearchParams): Promise<SearchResponse> {
    await this.wait()

    const tokens = tokenize(query)
    const found = tokens.length
      ? this.articles.filter((box) => {
          const text = searchableText(box)
          return tokens.every((t) => text.includes(t))
        })
      : this.articles
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
