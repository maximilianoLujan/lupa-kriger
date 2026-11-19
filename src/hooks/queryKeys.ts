/** Claves de TanStack Query. Centralizadas para poder invalidar por prefijo. */
export const queryKeys = {
  articles: {
    all: ['articles'] as const,
    search: (query: string, { inStock = false, startsWith = false }: { inStock?: boolean; startsWith?: boolean } = {}) =>
      ['articles', 'search', query, { inStock, startsWith }] as const,
    detail: (code: string) => ['articles', 'detail', code] as const,
  },
  warehouses: ['warehouses'] as const,
  orders: {
    all: ['orders'] as const,
    history: ['orders', 'history'] as const,
  },
}
