import type { ProductBox, SearchParams, SearchResponse, Warehouse } from '../../../types/article'
import type { Order, OrdersResponse, PageParams } from '../../../types/order'
import { normalizeText, tokenize } from '../../../utils/text'
import { DEFAULT_PAGE_SIZE, type ArticlesRepository } from '../repository'
import { MOCK_ARTICLES } from './articles.mock'
import { MOCK_ORDERS } from './orders.mock'
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

export class MockArticlesRepository implements ArticlesRepository {
  private readonly articles: ProductBox[]
  private readonly warehouses: Warehouse[]
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
    this.orders = orders
    this.delayMs = delayMs
  }

  async search({ query, page, pageSize = DEFAULT_PAGE_SIZE }: SearchParams): Promise<SearchResponse> {
    await this.wait()

    const tokens = tokenize(query)
    const matches = tokens.length
      ? this.articles.filter((box) => {
          const text = searchableText(box)
          return tokens.every((t) => text.includes(t))
        })
      : this.articles

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

  private wait() {
    return this.delayMs > 0 ? new Promise((r) => setTimeout(r, this.delayMs)) : Promise.resolve()
  }
}
