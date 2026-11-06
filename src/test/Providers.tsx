import { QueryClientProvider } from '@tanstack/react-query'
import { useState, type ReactNode } from 'react'
import { AuthProvider } from '../auth/AuthProvider'
import { createTestQueryClient } from './queryClient'

/** Los providers globales de la app, para envolver componentes en tests. */
export function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(createTestQueryClient)
  return (
    <QueryClientProvider client={client}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  )
}
