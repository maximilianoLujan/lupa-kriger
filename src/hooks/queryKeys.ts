/** Claves de TanStack Query. Centralizadas para poder invalidar por prefijo. */
export const queryKeys = {
  articles: {
    all: ['articles'] as const,
    search: (query: string) => ['articles', 'search', query] as const,
  },
  warehouses: ['warehouses'] as const,
}
