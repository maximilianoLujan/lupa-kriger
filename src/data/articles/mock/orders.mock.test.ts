import { describe, expect, it } from 'vitest'
import { MOCK_ARTICLES } from './articles.mock'
import { MOCK_ORDERS } from './orders.mock'

const allAlternatives = MOCK_ARTICLES.flatMap((b) => b.alternatives)

describe('MOCK_ORDERS', () => {
  it('trae 20 pedidos, del más nuevo al más viejo y con números únicos', () => {
    expect(MOCK_ORDERS).toHaveLength(20)
    const dates = MOCK_ORDERS.map((o) => o.createdAt)
    expect(dates).toEqual([...dates].sort().reverse())
    expect(new Set(MOCK_ORDERS.map((o) => o.number)).size).toBe(20)
  })

  it('cada renglón sale de un artículo del catálogo mock y el total cierra', () => {
    for (const order of MOCK_ORDERS) {
      expect(order.items.length).toBeGreaterThan(0)
      for (const item of order.items) {
        const article = allAlternatives.find((a) => a.articleCode === item.articleCode)
        expect(article, `artículo ${item.articleCode} del pedido ${order.number}`).toBeDefined()
        expect(item.unitPrice).toBe(article!.priceList)
        expect(item.brandName).toBe(article!.brandName)
        expect(item.quantity).toBeGreaterThan(0)
      }
      expect(order.total).toBe(order.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0))
    }
  })

  it('cubre pedidos en curso, entregados y cancelados', () => {
    const statuses = new Set(MOCK_ORDERS.map((o) => o.status))
    expect(statuses).toContain('pendiente')
    expect(statuses).toContain('enviado')
    expect(statuses).toContain('entregado')
    expect(statuses).toContain('cancelado')
  })
})
