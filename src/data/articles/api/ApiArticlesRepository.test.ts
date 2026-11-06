import { describe, expect, it, vi } from 'vitest'
import { ApiArticlesRepository } from './ApiArticlesRepository'

function fakeFetch(body: unknown, ok = true, status = 200) {
  return vi.fn(async () => ({ ok, status, json: async () => body })) as unknown as typeof fetch
}

describe('ApiArticlesRepository', () => {
  it('exige una URL base', () => {
    expect(() => new ApiArticlesRepository('')).toThrow(/VITE_API_URL/)
  })

  it('arma la URL de búsqueda con query, página y tamaño', async () => {
    const response = { data: [], page: 2, hasMore: false, total: 0 }
    const fetchFn = fakeFetch(response)
    const repo = new ApiArticlesRepository('https://api.test', fetchFn)

    const res = await repo.search({ query: 'bujia fiat', page: 2, pageSize: 5 })

    expect(res).toEqual(response)
    expect(fetchFn).toHaveBeenCalledWith(
      'https://api.test/articles/search?q=bujia+fiat&page=2&pageSize=5',
      expect.objectContaining({ headers: { Accept: 'application/json' } }),
    )
  })

  it('usa el tamaño de página por defecto', async () => {
    const fetchFn = fakeFetch({ data: [], page: 1, hasMore: false, total: 0 })
    await new ApiArticlesRepository('https://api.test', fetchFn).search({ query: '', page: 1 })
    expect(fetchFn).toHaveBeenCalledWith(expect.stringContaining('pageSize=10'), expect.anything())
  })

  it('pide las sucursales', async () => {
    const warehouses = [{ code: 'GUA', shortName: 'GUA', name: 'Guatraché' }]
    const fetchFn = fakeFetch(warehouses)
    const repo = new ApiArticlesRepository('https://api.test', fetchFn)

    expect(await repo.getWarehouses()).toEqual(warehouses)
    expect(fetchFn).toHaveBeenCalledWith('https://api.test/warehouses', expect.anything())
  })

  it('lanza error con el status cuando la respuesta no es ok', async () => {
    const repo = new ApiArticlesRepository('https://api.test', fakeFetch(null, false, 500))
    await expect(repo.getWarehouses()).rejects.toThrow(/500/)
  })
})
