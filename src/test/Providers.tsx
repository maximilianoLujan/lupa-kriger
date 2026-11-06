import type { ReactNode } from 'react'
import { AuthProvider } from '../auth/AuthProvider'
import { CartProvider } from '../cart/CartProvider'

/** Los providers globales de la app, para envolver componentes en tests. */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>{children}</CartProvider>
    </AuthProvider>
  )
}
