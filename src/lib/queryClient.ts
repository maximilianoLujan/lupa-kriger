import { QueryClient } from '@tanstack/react-query'
import { ApiError } from './http'

/** Cliente de TanStack Query con los defaults de la app. */
export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        refetchOnWindowFocus: false,
        // Un reintento para fallos de red; nunca para errores de sesión o del cliente.
        retry: (count, error) => {
          if (error instanceof ApiError && (error.status === 401 || (error.status >= 400 && error.status < 500))) {
            return false
          }
          return count < 1
        },
      },
      mutations: { retry: false },
    },
  })
}
