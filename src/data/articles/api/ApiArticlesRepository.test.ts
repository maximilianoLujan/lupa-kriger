import { describe, expect, it, vi } from 'vitest'
import { SESSION_EXPIRED_EVENT } from '../../../auth/session'
import { ApiArticlesRepository } from './ApiArticlesRepository'

function fakeFetch(body: unknown, ok = true, status = 200) {
  return vi.fn(async () => ({ ok, status, json: async () => body })) as unknown as typeof fetch
}

const EMPTY = { items: [], page: 1, pageSize: 10, hasMore: false, total: 0 }
const token = () => 'tok'

describe('ApiArticlesRepository', () => {
  it('exige una URL base', () => {
    expect(() => new ApiArticlesRepository('')).toThrow(/VITE_API_URL/)
  })

  it('arma la URL de búsqueda con query, página y tamaño, y manda el token', async () => {
    const fetchFn = fakeFetch({ ...EMPTY, page: 2 })
    const repo = new ApiArticlesRepository('https://api.test', fetchFn, token)

    const res = await repo.search({ query: 'bujia fiat', page: 2, pageSize: 5 })

    expect(res).toEqual({ data: [], page: 2, hasMore: false, total: 0 })
    expect(fetchFn).toHaveBeenCalledWith(
      'https://api.test/v1/lupa/articles/search?q=bujia+fiat&page=2&pageSize=5',
      expect.objectContaining({ headers: { Accept: 'application/json', Authorization: 'Bearer tok' } }),
    )
  })

  it('usa el tamaño de página por defecto', async () => {
    const fetchFn = fakeFetch(EMPTY)
    await new ApiArticlesRepository('https://api.test', fetchFn, token).search({ query: '', page: 1 })
    expect(fetchFn).toHaveBeenCalledWith(expect.stringContaining('pageSize=10'), expect.anything())
  })

  it('traduce las cajitas de la API a los tipos de la app', async () => {
    const fetchFn = fakeFetch({
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
            { code: 'FR-100', name: 'Filtro Fram', brandName: 'Fram', oemCodes: [], price: '2420.00', stock: { GUA: '12.000' } },
            { code: 'MN-200', name: 'Filtro Mann', brandName: null, oemCodes: [], price: null, stock: {} },
          ],
        },
      ],
    })
    const res = await new ApiArticlesRepository('https://api.test', fetchFn, token).search({ query: 'filtro', page: 1 })

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
      },
    ])
  })

  it('pide las sucursales y usa el código como nombre corto', async () => {
    const fetchFn = fakeFetch({ items: [{ code: 'GUA', name: 'Guatraché' }] })
    const repo = new ApiArticlesRepository('https://api.test', fetchFn, token)

    expect(await repo.getWarehouses()).toEqual([{ code: 'GUA', shortName: 'GUA', name: 'Guatraché' }])
    expect(fetchFn).toHaveBeenCalledWith('https://api.test/v1/lupa/warehouses', expect.anything())
  })

  it('lanza error con el status cuando la respuesta no es ok', async () => {
    const repo = new ApiArticlesRepository('https://api.test', fakeFetch(null, false, 500), token)
    await expect(repo.getWarehouses()).rejects.toThrow(/500/)
  })

  it('con 401 cierra la sesión y avisa', async () => {
    sessionStorage.setItem('auth:user', JSON.stringify({ username: 'a', name: 'A' }))
    const expired = vi.fn()
    window.addEventListener(SESSION_EXPIRED_EVENT, expired)
    const repo = new ApiArticlesRepository('https://api.test', fakeFetch(null, false, 401), token)

    await expect(repo.getWarehouses()).rejects.toThrow(/sesión venció/)

    expect(sessionStorage.getItem('auth:user')).toBeNull()
    expect(expired).toHaveBeenCalled()
    window.removeEventListener(SESSION_EXPIRED_EVENT, expired)
  })
})
