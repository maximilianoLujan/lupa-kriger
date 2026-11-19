import { describe, expect, it } from 'vitest'
import { MOCK_ARTICLES } from './articles.mock'
import { MOCK_ORDERS } from './orders.mock'
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

describe('MockArticlesRepository.getArticle', () => {
  it('arma la ficha de la cajita con el artículo pedido primero', async () => {
    const detail = await repo.getArticle('hqf-2234c')
    expect(detail).toMatchObject({ articleCode: 'HQF-2234C', groupName: 'PASTILLA DE FRENO DELANTERA' })
    expect(detail.alternatives.map((a) => a.particularCode)).toEqual(['HQF-2234C', 'FR-1024', 'N-1037'])
    expect(detail.compatibleModels.map((m) => m.model)).toContain('GOL TREND')

    const [article] = detail.alternatives
    expect(article).toMatchObject({ priceList: 34500, markupPct: 60, marginPct: 37.5, categoryName: 'Repuestos' })
    // Precio sin IVA y costo salen del precio de lista: 34500 / 1,21 y eso / 1,6.
    expect(article.priceNet).toBeCloseTo(28512.4, 1)
    expect(article.cost).toBeCloseTo(17820.25, 1)
    expect(article.details).toContain('JUEGO X4')
  })

  it('también encuentra por el código de la cajita y rechaza los que no existen', async () => {
    expect((await repo.getArticle('10002')).alternatives[0].particularCode).toBe('W 712/75')
    await expect(repo.getArticle('NO-EXISTE')).rejects.toThrow('No encontramos un artículo con ese código')
  })
})

describe('MockArticlesRepository.getWarehouses', () => {
  it('devuelve las sucursales mock', async () => {
    expect(await repo.getWarehouses()).toEqual(MOCK_WAREHOUSES)
  })
})

describe('datos mock', () => {
  it('con inStock deja solo los equivalentes con stock y saca las cajitas que se quedan sin ninguno', async () => {
    const alternative = (code: string, quantity: number) => ({
      articleCode: code, particularCode: code, description: code, brandCode: 'X', brandName: 'X', priceList: 1, stock: { GUA: quantity },
    })
    const article = (code: string, quantities: number[]) => ({
      articleCode: code, description: `FILTRO ${code}`, details: [], compatibleModels: [],
      alternatives: quantities.map((q, i) => alternative(`${code}-${i}`, q)),
    })
    const stocked = new MockArticlesRepository({ delayMs: 0, articles: [article('A', [3, 0]), article('B', [0, 0]), article('C', [1])] })

    const filtered = await stocked.search({ query: 'filtro', page: 1, inStock: true })
    expect(filtered.total).toBe(2)
    expect(filtered.data.map((b) => b.alternatives.map((a) => a.particularCode))).toEqual([['A-0'], ['C-0']])

    const all = await stocked.search({ query: 'filtro', page: 1 })
    expect(all.total).toBe(3)
    expect(all.data[0].alternatives).toHaveLength(2)
  })

  it('con startsWith trae solo lo que empieza con la búsqueda: descripción o código, sin lo que la tiene en el medio', async () => {
    const codes = async (query: string, startsWith = false) =>
      (await repo.search({ query, page: 1, pageSize: 50, startsWith })).data.map((b) => b.articleCode)

    // "aceite" está en el medio de "FILTRO DE ACEITE": sin el filtro sale, con el filtro no.
    expect(await codes('aceite')).toContain('10002')
    expect(await codes('aceite', true)).not.toContain('10002')
    // El comienzo de la descripción, sin importar acentos ni mayúsculas.
    expect(await codes('Filtro de acéite', true)).toContain('10002')
    // El comienzo del código de un equivalente, sin contar espacios ni guiones ("W 712/75").
    expect(await codes('w712', true)).toEqual(['10002'])
    expect(await codes('712', true)).toEqual([])
    // Empieza con la primera palabra y las demás están en cualquier lugar, sin contar los conectores.
    expect(await codes('filtro mann', true)).toContain('10002')
    expect(await codes('filtro para el mann', true)).toContain('10002')
    expect(await codes('mann filtro', true)).not.toContain('10002')
    // Sin texto no filtra nada.
    expect((await repo.search({ query: '', page: 1, startsWith: true })).total).toBe(MOCK_ARTICLES.length)
  })

  it('los conectores no cuentan al buscar', async () => {
    const codes = async (query: string) =>
      (await repo.search({ query, page: 1, pageSize: 50 })).data.map((b) => b.articleCode)
    expect(await codes('filtro para aceite')).toEqual(await codes('filtro aceite'))
    expect(await codes('filtro con el aceite')).toContain('10002')
  })

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
    expect(res.data[0].number).toBe('Nota de pedido 00000120')
    expect(res.data[9].number).toBe('Nota de pedido 00000111')
  })

  it('la segunda página es la última', async () => {
    const res = await repo.getOrders({ page: 2 })
    expect(res.data).toHaveLength(10)
    expect(res.hasMore).toBe(false)
    expect(res.data.at(-1)?.number).toBe('Nota de pedido 00000101')
  })

  it('respeta pageSize y corrige páginas menores a 1', async () => {
    const res = await repo.getOrders({ page: 0, pageSize: 3 })
    expect(res.page).toBe(1)
    expect(res.data).toHaveLength(3)
  })

  it('ordena por fecha aunque los pedidos inyectados vengan desordenados', async () => {
    const base = { id: '', status: 'completed' as const, items: [], total: 0 }
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

describe('MockArticlesRepository.createOrder', () => {
  it('arma el pedido con los precios del mock, le da el número siguiente y lo suma primero al historial', async () => {
    const own = new MockArticlesRepository({ delayMs: 0 })
    const order = await own.createOrder({ customerCode: '1001', items: [{ code: 'FR-1024', quantity: 2 }, { code: 'W 712/75', quantity: 1 }] })

    expect(order).toMatchObject({ id: '121', number: 'Nota de pedido', status: 'pending', total: 67600 })
    expect(order.items).toEqual([
      { articleCode: '10001-1', particularCode: 'FR-1024', brandName: 'FRIC-ROT', description: 'Pastilla freno delantera Fric-Rot', quantity: 2, unitPrice: 28900, total: 57800 },
      { articleCode: '10002-1', particularCode: 'W 712/75', brandName: 'MANN', description: 'Filtro de aceite Mann', quantity: 1, unitPrice: 9800, total: 9800 },
    ])
    const page = await own.getOrders({ page: 1 })
    expect(page.total).toBe(21)
    expect(page.data[0].id).toBe('121')
  })

  it('no toca la constante compartida: otro repositorio sigue con 20 pedidos', async () => {
    await new MockArticlesRepository({ delayMs: 0 }).createOrder({ customerCode: '1001', items: [{ code: 'FR-1024', quantity: 1 }] })
    expect((await repo.getOrders({ page: 1 })).total).toBe(20)
    expect(MOCK_ORDERS).toHaveLength(20)
  })

  it('rechaza códigos que no existen con el mismo mensaje que la API', async () => {
    await expect(repo.createOrder({ customerCode: '1001', items: [{ code: 'NO-EXISTE', quantity: 1 }] })).rejects.toThrow(
      'Estos artículos ya no están disponibles: NO-EXISTE',
    )
  })

  it('acepta el número de cliente con o sin ceros a la izquierda y rechaza los desconocidos con un mensaje amigable', async () => {
    const own = new MockArticlesRepository({ delayMs: 0 })
    await expect(own.createOrder({ customerCode: ' 001002 ', items: [{ code: 'FR-1024', quantity: 1 }] })).resolves.toBeDefined()
    await expect(own.createOrder({ customerCode: '9999', items: [{ code: 'FR-1024', quantity: 1 }] })).rejects.toThrow(
      'No encontramos un cliente con el número 9999. Revisalo o consultá a la empresa.',
    )
    expect((await own.getOrders({ page: 1 })).total).toBe(21)
  })
})
