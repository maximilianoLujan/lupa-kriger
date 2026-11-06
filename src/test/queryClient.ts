import { QueryClient } from '@tanstack/react-query'

/** Cliente de Query para tests: sin reintentos. Cada test crea el suyo, así no comparten caché. */
export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: 0 }, mutations: { retry: false } },
  })
}
