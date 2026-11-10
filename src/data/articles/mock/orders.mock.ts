import type { Order, OrderItem, OrderStatus } from '../../../types/order'
import { MOCK_ARTICLES } from './articles.mock'

/** Renglón de la semilla: código interno del equivalente (de `articles.mock.ts`) y cantidad. */
type SeedItem = [articleCode: string, quantity: number]

interface OrderSeed {
  number: number
  createdAt: string
  status: OrderStatus
  items: SeedItem[]
}

/**
 * Veinte pedidos de ejemplo, del más nuevo al más viejo. Los precios y descripciones
 * salen de los artículos del mock, así los datos quedan consistentes entre pantallas.
 */
const SEEDS: OrderSeed[] = [
  { number: 120, createdAt: '2026-11-09T10:12:00-03:00', status: 'pending', items: [['10001-1', 2], ['10002-1', 4]] },
  { number: 119, createdAt: '2026-11-06T16:40:00-03:00', status: 'preparing', items: [['10003-2', 2], ['10008-1', 2], ['10004-1', 8]] },
  { number: 118, createdAt: '2026-11-03T09:05:00-03:00', status: 'partial', items: [['10010-1', 1]] },
  { number: 117, createdAt: '2026-10-29T11:30:00-03:00', status: 'completed', items: [['10005-1', 3], ['10009-1', 1]] },
  { number: 116, createdAt: '2026-10-24T15:20:00-03:00', status: 'completed', items: [['10006-2', 1], ['10002-2', 2]] },
  { number: 115, createdAt: '2026-10-20T08:50:00-03:00', status: 'cancelled', items: [['10012-1', 6]] },
  { number: 114, createdAt: '2026-10-15T17:10:00-03:00', status: 'completed', items: [['10001-2', 1], ['10008-3', 2], ['10007-1', 2]] },
  { number: 113, createdAt: '2026-10-09T12:00:00-03:00', status: 'completed', items: [['10011-1', 2]] },
  { number: 112, createdAt: '2026-10-02T10:45:00-03:00', status: 'completed', items: [['10004-2', 4], ['10002-3', 3], ['10007-3', 1]] },
  { number: 111, createdAt: '2026-09-26T14:30:00-03:00', status: 'completed', items: [['10003-1', 2]] },
  { number: 110, createdAt: '2026-09-18T09:15:00-03:00', status: 'completed', items: [['10010-3', 1], ['10012-2', 2]] },
  { number: 109, createdAt: '2026-09-11T16:00:00-03:00', status: 'cancelled', items: [['10006-1', 1]] },
  { number: 108, createdAt: '2026-09-04T11:25:00-03:00', status: 'completed', items: [['10005-2', 2], ['10009-2', 1], ['10002-1', 2]] },
  { number: 107, createdAt: '2026-08-27T10:10:00-03:00', status: 'completed', items: [['10001-3', 3]] },
  { number: 106, createdAt: '2026-08-19T15:45:00-03:00', status: 'completed', items: [['10008-2', 2], ['10004-3', 4]] },
  { number: 105, createdAt: '2026-08-12T09:30:00-03:00', status: 'completed', items: [['10011-2', 2], ['10007-2', 1]] },
  { number: 104, createdAt: '2026-08-05T13:20:00-03:00', status: 'completed', items: [['10003-3', 2], ['10005-1', 1]] },
  { number: 103, createdAt: '2026-07-29T17:35:00-03:00', status: 'completed', items: [['10010-2', 1]] },
  { number: 102, createdAt: '2026-07-21T10:00:00-03:00', status: 'completed', items: [['10002-2', 5], ['10012-1', 2], ['10004-1', 4]] },
  { number: 101, createdAt: '2026-07-14T12:40:00-03:00', status: 'completed', items: [['10001-1', 1], ['10008-1', 1]] },
]

/** Título como lo arma el ERP para una nota de pedido: el número a ocho dígitos. */
export function orderTitle(number: number): string {
  return `Nota de pedido ${String(number).padStart(8, '0')}`
}

function toOrderItem([articleCode, quantity]: SeedItem): OrderItem {
  const article = MOCK_ARTICLES.flatMap((box) => box.alternatives).find((a) => a.articleCode === articleCode)
  if (!article) throw new Error(`El mock de pedidos referencia un artículo inexistente: ${articleCode}`)
  return {
    articleCode: article.articleCode,
    particularCode: article.particularCode,
    brandName: article.brandName,
    description: article.description,
    quantity,
    unitPrice: article.priceList,
    total: article.priceList * quantity,
  }
}

function toOrder(seed: OrderSeed): Order {
  const items = seed.items.map(toOrderItem)
  return {
    id: String(seed.number),
    number: orderTitle(seed.number),
    createdAt: seed.createdAt,
    status: seed.status,
    items,
    total: items.reduce((sum, i) => sum + i.total, 0),
  }
}

/** Historial de pedidos hardcodeado para el MVP: 20 pedidos, del más nuevo al más viejo. */
export const MOCK_ORDERS: Order[] = SEEDS.map(toOrder)
