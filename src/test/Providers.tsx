import { QueryClientProvider } from '@tanstack/react-query'
import { useState, type ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '../auth/AuthProvider'
import { createTestQueryClient } from './queryClient'

interface ProvidersProps {
  children: ReactNode
  /** Ruta inicial del router en memoria. */
  route?: string
}

/** Los providers globales de la app (Query, sesión y router en memoria), para envolver componentes en tests. */
export function Providers({ children, route = '/' }: ProvidersProps) {
  const [client] = useState(createTestQueryClient)
  return (
    <QueryClientProvider client={client}>
      <AuthProvider>
        <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}
