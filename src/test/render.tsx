import { render, type RenderOptions } from '@testing-library/react'
import type { ReactElement, ReactNode } from 'react'
import { Providers } from './Providers'

interface Options extends Omit<RenderOptions, 'wrapper'> {
  /** Ruta inicial del router en memoria. Por defecto `/`. */
  route?: string
}

// Renderiza un componente con los providers globales de la app.
export function renderWithProviders(ui: ReactElement, { route, ...options }: Options = {}) {
  const Wrapper = ({ children }: { children: ReactNode }) => <Providers route={route}>{children}</Providers>
  return render(ui, { wrapper: Wrapper, ...options })
}
