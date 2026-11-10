import { describe, expect, it } from 'vitest'
import { MOCK_ARTICLES } from './articles.mock'
import { MockArticlesRepository } from './MockArticlesRepository'
import { MOCK_WAREHOUSES } from './warehouses.mock'

const repo = new MockArticlesRepository({ delayMs: 0 })

describe('MockArticlesRepository.search', () => {
  it('sin query devuelve la primera página de todo el catálogo', async () => {
    const res = await repo.search({ query: '', page: 1 })
    expect(res.total).toBe(MOCK_ARTICLES.length)
    expect(res.data).toHaveLength(10)
    expect(res.page).toBe(1)
    expect(res.hasMore).toBe(true)
  })

  it('pagina y marca la última página', async () => {
    const res = await repo.search({ query: '', page: 2 })
    expect(res.data).toHaveLength(MOCK_ARTICLES.length - 10)
    expect(res.hasMore).toBe(false)
  })

  it('respeta pageSize', async () => {
    const res = await repo.search({ query: '', page: 1, pageSize: 3 })
    expect(res.data).toHaveLength(3)
    expect(res.hasMore).toBe(true)
  })

  it('busca por descripción sin importar acentos ni mayúsculas', async () => {
    const res = await repo.search({ query: 'BUJÍA', page: 1 })
    expect(res.total).toBe(1)
    expect(res.data[0].description).toBe('BUJIA DE ENCENDIDO')
  })

  it('busca por código de fabricante', async () => {
    const res = await repo.search({ query: 'W 712/75', page: 1 })
    expect(res.data.map((b) => b.description)).toEqual(['FILTRO DE ACEITE'])
  })

  it('busca por marca del equivalente', async () => {
    const res = await repo.search({ query: 'bosch', page: 1 })
    expect(res.total).toBe(2)
  })

  it('busca por modelo de auto', async () => {
    const res = await repo.search({ query: 'hilux', page: 1 })
    expect(res.data.map((b) => b.description)).toEqual(['FILTRO DE AIRE'])
  })

  it('todas las palabras tienen que coincidir', async () => {
    const res = await repo.search({ query: 'filtro peugeot', page: 1 })
    expect(res.data.map((b) => b.description)).toEqual(['FILTRO DE ACEITE'])
  })

  it('devuelve vacío cuando nada coincide', async () => {
    const res = await repo.search({ query: 'zzz', page: 1 })
    expect(res).toEqual({ data: [], page: 1, hasMore: false, total: 0 })
  })

  it('una página fuera de rango devuelve vacío sin romper', async () => {
    const res = await repo.search({ query: '', page: 99 })
    expect(res.data).toEqual([])
    expect(res.hasMore).toBe(false)
  })

  it('página 0 o negativa se trata como la primera', async () => {
    const res = await repo.search({ query: '', page: 0 })
    expect(res.page).toBe(1)
    expect(res.data).toHaveLength(10)
  })

  it('acepta artículos y sucursales custom', async () => {
    const custom = new MockArticlesRepository({
      articles: [MOCK_ARTICLES[0]],
      warehouses: [{ code: 'X', shortName: 'X', name: 'X' }],
      delayMs: 0,
    })
    expect((await custom.search({ query: '', page: 1 })).total).toBe(1)
    expect(await custom.getWarehouses()).toEqual([{ code: 'X', shortName: 'X', name: 'X' }])
  })

  it('simula demora cuando delayMs > 0', async () => {
    const slow = new MockArticlesRepository({ delayMs: 5 })
    const start = Date.now()
    await slow.search({ query: '', page: 1 })
    expect(Date.now() - start).toBeGreaterThanOrEqual(4)
  })
})

describe('MockArticlesRepository.getWarehouses', () => {
  it('devuelve las sucursales mock', async () => {
    expect(await repo.getWarehouses()).toEqual(MOCK_WAREHOUSES)
  })
})

describe('datos mock', () => {
  it('cada equivalente tiene stock para todas las sucursales', () => {
    for (const box of MOCK_ARTICLES) {
      for (const alt of box.alternatives) {
        for (const w of MOCK_WAREHOUSES) {
          expect(alt.stock[w.code], `${alt.particularCode} ${w.code}`).toBeTypeOf('number')
        }
      }
    }
  })

  it('no hay códigos de artículo repetidos', () => {
    const codes = MOCK_ARTICLES.flatMap((b) => [b.articleCode, ...b.alternatives.map((a) => a.articleCode)])
    expect(new Set(codes).size).toBe(codes.length)
  })
})

describe('MockArticlesRepository.getOrders', () => {
  it('devuelve la primera página de 10 pedidos, del más nuevo al más viejo', async () => {
    const res = await repo.getOrders({ page: 1 })
    expect(res.total).toBe(20)
    expect(res.data).toHaveLength(10)
    expect(res.page).toBe(1)
    expect(res.hasMore).toBe(true)
    expect(res.data[0].number).toBe('P-000120')
    expect(res.data[9].number).toBe('P-000111')
  })

  it('la segunda página es la última', async () => {
    const res = await repo.getOrders({ page: 2 })
    expect(res.data).toHaveLength(10)
    expect(res.hasMore).toBe(false)
    expect(res.data.at(-1)?.number).toBe('P-000101')
  })

  it('respeta pageSize y corrige páginas menores a 1', async () => {
    const res = await repo.getOrders({ page: 0, pageSize: 3 })
    expect(res.page).toBe(1)
    expect(res.data).toHaveLength(3)
  })

  it('ordena por fecha aunque los pedidos inyectados vengan desordenados', async () => {
    const base = { id: '', status: 'entregado' as const, items: [], total: 0 }
    const custom = new MockArticlesRepository({
      delayMs: 0,
      orders: [
        { ...base, id: 'a', number: 'A', createdAt: '2026-01-01T00:00:00Z' },
        { ...base, id: 'b', number: 'B', createdAt: '2026-03-01T00:00:00Z' },
      ],
    })
    const res = await custom.getOrders({ page: 1 })
    expect(res.data.map((o) => o.number)).toEqual(['B', 'A'])
    expect(res.hasMore).toBe(false)
  })

  it('sin pedidos devuelve vacío', async () => {
    const empty = new MockArticlesRepository({ delayMs: 0, orders: [] })
    expect(await empty.getOrders({ page: 1 })).toEqual({ data: [], page: 1, hasMore: false, total: 0 })
  })
})
