import { describe, expect, it } from 'vitest'
import { SESSION_EXPIRED_MESSAGE } from '../../../lib/http'
import { bodyOf, fakeHttp, replyWith } from '../../../test/fakeHttp'
import { ApiArticlesRepository, photoSrc } from './ApiArticlesRepository'

const EMPTY = { items: [], page: 1, pageSize: 10, hasMore: false, total: 0 }

describe('ApiArticlesRepository', () => {
  it('arma la búsqueda con query, página y tamaño', async () => {
    const { http, calls } = replyWith(200, { ...EMPTY, page: 2 })
    const repo = new ApiArticlesRepository(http)

    const res = await repo.search({ query: 'bujia fiat', page: 2, pageSize: 5 })

    expect(res).toEqual({ data: [], page: 2, hasMore: false, total: 0 })
    expect(calls[0].url).toBe('/v1/lupa/articles/search')
    expect(calls[0].params).toEqual({ q: 'bujia fiat', page: 2, pageSize: 5 })
  })

  it('usa el tamaño de página por defecto', async () => {
    const { http, calls } = replyWith(200, EMPTY)
    await new ApiArticlesRepository(http).search({ query: '', page: 1 })
    expect(calls[0].params).toMatchObject({ pageSize: 10 })
  })

  it('pide solo artículos con stock cuando se lo indican', async () => {
    const { http, calls } = replyWith(200, EMPTY)
    await new ApiArticlesRepository(http).search({ query: 'filtro', page: 1, inStock: true })
    expect(calls[0].params).toEqual({ q: 'filtro', page: 1, pageSize: 10, inStock: true })
  })

  it('pide solo los que comienzan con la búsqueda cuando se lo indican', async () => {
    const { http, calls } = replyWith(200, EMPTY)
    await new ApiArticlesRepository(http).search({ query: 'fil', page: 1, startsWith: true })
    expect(calls[0].params).toEqual({ q: 'fil', page: 1, pageSize: 10, startsWith: true })
  })

  it('traduce las cajitas de la API a los tipos de la app', async () => {
    const { http } = replyWith(200, {
      ...EMPTY,
      total: 1,
      items: [
        {
          code: 'FR-100',
          name: 'FILTRO DE ACEITE',
          details: ['Rosca 3/4'],
          compatibleModels: [
            { make: 'Peugeot', model: '206', yearFrom: 1999, yearTo: 2012 },
            { make: 'Citroën', model: 'C3', yearFrom: null, yearTo: null },
          ],
          alternatives: [
            { code: 'FR-100', name: 'Filtro Fram', brandName: 'Fram', oemCodes: [], price: '2420.00', stock: { GUA: '12.000' }, photoUrl: '/v1/public/lupa/photos?token=abc.def' },
            { code: 'MN-200', name: 'Filtro Mann', brandName: null, oemCodes: [], price: null, stock: {}, photoUrl: null },
          ],
          photoUrl: '/v1/public/lupa/photos?token=abc.def',
        },
      ],
    })
    const res = await new ApiArticlesRepository(http).search({ query: 'filtro', page: 1 })

    expect(res.total).toBe(1)
    expect(res.data).toEqual([
      {
        articleCode: 'FR-100',
        description: 'FILTRO DE ACEITE',
        details: ['Rosca 3/4'],
        compatibleModels: [
          { brandName: 'Peugeot', model: '206', since: '1999', until: '2012' },
          { brandName: 'Citroën', model: 'C3' },
        ],
        alternatives: [
          { articleCode: 'FR-100', particularCode: 'FR-100', description: 'Filtro Fram', brandCode: 'Fram', brandName: 'Fram', priceList: 2420, stock: { GUA: 12 } },
          { articleCode: 'MN-200', particularCode: 'MN-200', description: 'Filtro Mann', brandCode: '', brandName: '', priceList: 0, stock: {} },
        ],
        // La ruta firmada se vuelve absoluta (base del cliente HTTP); la miniatura pide `variant=thumb`.
        photoUrl: 'https://api.test/v1/public/lupa/photos?token=abc.def',
        photoThumbUrl: 'https://api.test/v1/public/lupa/photos?token=abc.def&variant=thumb',
      },
    ])
  })

  it('pasa la ubicación de cada equivalente; si viene vacía, el equivalente queda sin `locations`', async () => {
    const alternative = { name: 'Filtro', brandName: 'Fram', oemCodes: [], price: '1.00', stock: {}, photoUrl: null }
    const { http } = replyWith(200, {
      ...EMPTY,
      total: 1,
      items: [
        {
          code: 'FR-100',
          name: 'FILTRO',
          details: [],
          compatibleModels: [],
          alternatives: [
            { ...alternative, code: 'FR-100', locations: { GUA: 'A-03-12', NOR: 'Estante 4' } },
            { ...alternative, code: 'MN-200', locations: {} },
          ],
          photoUrl: null,
        },
      ],
    })
    const res = await new ApiArticlesRepository(http).search({ query: 'filtro', page: 1 })
    const [fram, mann] = res.data[0].alternatives
    expect(fram.locations).toEqual({ GUA: 'A-03-12', NOR: 'Estante 4' })
    expect(mann).not.toHaveProperty('locations')
  })

  it('pasa el punto de pedido de cada equivalente; sin permiso (null) el equivalente queda sin `reorderPoint`', async () => {
    const alternative = { name: 'Filtro', brandName: 'Fram', oemCodes: [], price: '1.00', stock: {}, photoUrl: null }
    const { http } = replyWith(200, {
      ...EMPTY,
      total: 1,
      items: [
        {
          code: 'FR-100',
          name: 'FILTRO',
          details: [],
          compatibleModels: [],
          alternatives: [
            { ...alternative, code: 'FR-100', minStock: '5.000' },
            { ...alternative, code: 'MN-200', minStock: '0.000' },
            { ...alternative, code: 'WG-300', minStock: null },
          ],
          photoUrl: null,
        },
      ],
    })
    const res = await new ApiArticlesRepository(http).search({ query: 'filtro', page: 1 })
    const [fram, mann, wega] = res.data[0].alternatives
    expect(fram.reorderPoint).toBe(5)
    expect(mann.reorderPoint).toBe(0)
    expect(wega).not.toHaveProperty('reorderPoint')
  })

  it('una cajita sin foto queda sin photoUrl (la UI muestra el logo)', async () => {
    const { http } = replyWith(200, {
      ...EMPTY,
      total: 1,
      items: [{ code: 'X', name: 'X', details: [], compatibleModels: [], alternatives: [], photoUrl: null }],
    })
    const res = await new ApiArticlesRepository(http).search({ query: 'x', page: 1 })
    expect(res.data[0]).not.toHaveProperty('photoUrl')
    expect(res.data[0]).not.toHaveProperty('photoThumbUrl')
  })

  describe('photoSrc', () => {
    it('suma la base sin barra doble; sin variant es la foto completa', () => {
      expect(photoSrc('https://api.test/', '/v1/public/lupa/photos?token=t')).toBe(
        'https://api.test/v1/public/lupa/photos?token=t',
      )
    })

    it('con variant thumb lo agrega como parámetro extra (& si ya hay query, ? si no)', () => {
      expect(photoSrc('https://api.test', '/v1/public/lupa/photos?token=t', 'thumb')).toBe(
        'https://api.test/v1/public/lupa/photos?token=t&variant=thumb',
      )
      expect(photoSrc('https://api.test', '/foto.jpg', 'thumb')).toBe('https://api.test/foto.jpg?variant=thumb')
    })

    it('sin ruta devuelve undefined', () => {
      expect(photoSrc('https://api.test', null)).toBeUndefined()
      expect(photoSrc('https://api.test', '', 'thumb')).toBeUndefined()
    })
  })

  it('pide las sucursales y usa el código como nombre corto', async () => {
    const { http, calls } = replyWith(200, { items: [{ code: 'GUA', name: 'Guatraché' }] })
    const repo = new ApiArticlesRepository(http)

    expect(await repo.getWarehouses()).toEqual([{ code: 'GUA', shortName: 'GUA', name: 'Guatraché' }])
    expect(calls[0].url).toBe('/v1/lupa/warehouses')
  })

  it('propaga los errores del cliente HTTP con status y mensaje', async () => {
    await expect(new ApiArticlesRepository(replyWith(500).http).getWarehouses()).rejects.toMatchObject({ status: 500 })
  })

  it('con 401 sin posibilidad de renovar, el cliente cierra la sesión', async () => {
    sessionStorage.setItem('auth:user', JSON.stringify({ username: 'a', name: 'A' }))
    const repo = new ApiArticlesRepository(fakeHttp(() => ({ status: 401 })).http)

    await expect(repo.getWarehouses()).rejects.toThrow(SESSION_EXPIRED_MESSAGE)
    expect(sessionStorage.getItem('auth:user')).toBeNull()
  })
})

describe('ApiArticlesRepository.getOrders', () => {
  it('pide el historial paginado y traduce los pedidos', async () => {
    const { http, calls } = replyWith(200, {
      items: [
        {
          id: '77',
          number: 'Nota de pedido 00000077',
          createdAt: '2026-11-09T10:12:00-03:00',
          status: 'partial',
          total: '67600.00',
          items: [
            { code: 'FR-1024', name: 'Pastilla freno', brandName: 'Fric-Rot', quantity: '2.000', unitPrice: '28900.00', total: '57800.00' },
            { code: 'W 712/75', name: 'Filtro aceite', brandName: null, quantity: '1.000', unitPrice: '9800.00', total: '9800.00' },
          ],
        },
      ],
      page: 2,
      pageSize: 10,
      hasMore: true,
      total: 20,
    })

    const res = await new ApiArticlesRepository(http).getOrders({ page: 2 })

    expect(calls[0].url).toBe('/v1/lupa/orders')
    expect(calls[0].params).toEqual({ page: 2, pageSize: 10 })
    expect(res).toEqual({
      page: 2,
      hasMore: true,
      total: 20,
      data: [
        {
          id: '77',
          number: 'Nota de pedido 00000077',
          createdAt: '2026-11-09T10:12:00-03:00',
          status: 'partial',
          total: 67600,
          items: [
            { articleCode: 'FR-1024', particularCode: 'FR-1024', brandName: 'Fric-Rot', description: 'Pastilla freno', quantity: 2, unitPrice: 28900, total: 57800 },
            { articleCode: 'W 712/75', particularCode: 'W 712/75', brandName: '', description: 'Filtro aceite', quantity: 1, unitPrice: 9800, total: 9800 },
          ],
        },
      ],
    })
  })

  it('un estado desconocido se muestra como pendiente', async () => {
    const order = { id: '1', number: 'Nota de pedido 00000001', createdAt: '2026-01-01T00:00:00Z', status: 'RARO', total: '0', items: [] }
    const { http } = replyWith(200, { items: [order], page: 1, pageSize: 10, hasMore: false, total: 1 })
    const res = await new ApiArticlesRepository(http).getOrders({ page: 1 })
    expect(res.data[0].status).toBe('pending')
  })

  it('propaga los errores HTTP', async () => {
    await expect(new ApiArticlesRepository(replyWith(500).http).getOrders({ page: 1 })).rejects.toMatchObject({ status: 500 })
  })
})

describe('ApiArticlesRepository.createOrder', () => {
  const created = {
    id: '78',
    number: 'Nota de pedido 00000078',
    createdAt: '2026-11-10T12:00:00-03:00',
    status: 'pending',
    total: '4840.00',
    items: [{ code: 'BK-6', name: 'Bujía', brandName: 'NGK', quantity: '2.000', unitPrice: '2420.00', total: '4840.00' }],
  }

  it('manda los códigos con la cantidad como texto y traduce el pedido creado', async () => {
    const { http, calls } = replyWith(201, created)
    const order = await new ApiArticlesRepository(http).createOrder({ customerCode: ' 1001 ', items: [{ code: 'BK-6', quantity: 2 }] })

    expect(calls[0].method).toBe('post')
    expect(calls[0].url).toBe('/v1/lupa/orders')
    expect(bodyOf(calls[0])).toEqual({ customerCode: '1001', items: [{ code: 'BK-6', quantity: '2' }] })
    expect(order).toEqual({
      id: '78',
      number: 'Nota de pedido 00000078',
      createdAt: '2026-11-10T12:00:00-03:00',
      status: 'pending',
      total: 4840,
      items: [{ articleCode: 'BK-6', particularCode: 'BK-6', brandName: 'NGK', description: 'Bujía', quantity: 2, unitPrice: 2420, total: 4840 }],
    })
  })

  it('manda las observaciones solo si las hay', async () => {
    const { http, calls } = replyWith(201, created)
    await new ApiArticlesRepository(http).createOrder({ customerCode: '1001', items: [{ code: 'BK-6', quantity: 1 }], notes: 'Lo retiro el lunes' })
    expect(bodyOf(calls[0])).toEqual({ customerCode: '1001', items: [{ code: 'BK-6', quantity: '1' }], notes: 'Lo retiro el lunes' })
  })

  it('un 400 de la API llega con su mensaje (número de cliente inexistente, artículo inactivo)', async () => {
    const { http } = replyWith(400, { statusCode: 400, error: 'Bad Request', message: 'No encontramos un cliente con el número 9999. Revisalo o consultá a la empresa' })
    await expect(new ApiArticlesRepository(http).createOrder({ customerCode: '9999', items: [{ code: 'BK-6', quantity: 1 }] })).rejects.toThrow(
      'No encontramos un cliente con el número 9999',
    )
  })

  it('trae la fecha del precio de cada equivalente', async () => {
    const alternative = { code: 'A', name: 'A', brandName: null, oemCodes: [], price: '10.00', stock: {}, photoUrl: null }
    const { http } = replyWith(200, {
      ...EMPTY,
      items: [
        {
          code: 'A',
          name: 'A',
          details: [],
          compatibleModels: [],
          photoUrl: null,
          alternatives: [
            { ...alternative, priceUpdatedAt: '2026-10-01T12:00:00.000Z' },
            { ...alternative, code: 'B', priceUpdatedAt: null },
            { ...alternative, code: 'C' },
          ],
        },
      ],
    })
    const [box] = (await new ApiArticlesRepository(http).search({ query: 'a', page: 1 })).data
    expect(box.alternatives[0].priceUpdatedAt).toBe('2026-10-01T12:00:00.000Z')
    expect(box.alternatives[1]).not.toHaveProperty('priceUpdatedAt')
    expect(box.alternatives[2]).not.toHaveProperty('priceUpdatedAt')
  })

  it('pide la ficha por código y la traduce a los tipos de la app', async () => {
    const base = {
      oemCodes: [],
      stock: {},
      locations: {},
      minStock: null,
      photoUrl: null,
      description: [],
      categoryName: null,
      compatibleModels: [],
      costUpdatedAt: '2026-09-15T12:30:00.000Z',
    }
    const { http, calls } = replyWith(200, {
      code: 'MN-200',
      name: 'FILTRO DE ACEITE',
      groupName: 'FILTRO DE ACEITE',
      details: ['Se vende por unidad'],
      compatibleModels: [{ make: 'Peugeot', model: '206', yearFrom: 1999, yearTo: 2012 }],
      photoUrl: '/v1/public/lupa/photos?token=abc.def',
      alternatives: [
        {
          ...base,
          code: 'MN-200',
          name: 'Filtro Mann',
          brandName: 'Mann',
          oemCodes: ['1109AL'],
          price: '3630.00',
          priceUpdatedAt: '2026-10-01T12:00:00.000Z',
          stock: { GUA: '3.000' },
          locations: { GUA: 'Estante 4' },
          minStock: '5.000',
          photoUrl: '/v1/public/lupa/photos?token=abc.def',
          description: ['Rosca 3/4'],
          categoryName: 'Filtros',
          compatibleModels: [{ make: 'Citroën', model: 'C3', yearFrom: null, yearTo: null }],
          priceNet: '3000.00',
          cost: '1500.00',
          markupPct: '100.00',
          marginPct: '50.00',
        },
        { ...base, code: 'FR-100', name: 'Filtro Fram', brandName: null, price: null, priceUpdatedAt: null, priceNet: null, cost: null, markupPct: null, marginPct: null },
      ],
    })

    const detail = await new ApiArticlesRepository(http).getArticle('MN-200')

    expect(calls[0].url).toBe('/v1/lupa/articles/detail')
    expect(calls[0].params).toEqual({ code: 'MN-200' })
    expect(detail).toMatchObject({
      articleCode: 'MN-200',
      description: 'FILTRO DE ACEITE',
      groupName: 'FILTRO DE ACEITE',
      details: ['Se vende por unidad'],
      compatibleModels: [{ brandName: 'Peugeot', model: '206', since: '1999', until: '2012' }],
      photoUrl: 'https://api.test/v1/public/lupa/photos?token=abc.def',
      photoThumbUrl: 'https://api.test/v1/public/lupa/photos?token=abc.def&variant=thumb',
    })
    expect(detail.alternatives[0]).toEqual({
      articleCode: 'MN-200',
      particularCode: 'MN-200',
      description: 'Filtro Mann',
      brandCode: 'Mann',
      brandName: 'Mann',
      priceList: 3630,
      priceUpdatedAt: '2026-10-01T12:00:00.000Z',
      stock: { GUA: 3 },
      locations: { GUA: 'Estante 4' },
      reorderPoint: 5,
      details: ['Rosca 3/4'],
      categoryName: 'Filtros',
      compatibleModels: [{ brandName: 'Citroën', model: 'C3' }],
      oemCodes: ['1109AL'],
      priceNet: 3000,
      cost: 1500,
      costUpdatedAt: '2026-09-15T12:30:00.000Z',
      markupPct: 100,
      marginPct: 50,
      photoUrl: 'https://api.test/v1/public/lupa/photos?token=abc.def',
      photoThumbUrl: 'https://api.test/v1/public/lupa/photos?token=abc.def&variant=thumb',
    })
    // Lo que la API no puede calcular no se inventa.
    const fram = detail.alternatives[1]
    expect(fram).toMatchObject({ particularCode: 'FR-100', priceList: 0, brandName: '' })
    for (const key of ['priceNet', 'cost', 'markupPct', 'marginPct', 'priceUpdatedAt', 'categoryName', 'photoUrl']) {
      expect(fram).not.toHaveProperty(key)
    }
  })

  it('sin grupo la ficha no trae nombre de grupo', async () => {
    const { http } = replyWith(200, { code: 'A', name: 'A', groupName: null, details: [], compatibleModels: [], photoUrl: null, alternatives: [] })
    expect(await new ApiArticlesRepository(http).getArticle('A')).not.toHaveProperty('groupName')
  })
})
