import { render, type RenderOptions } from '@testing-library/react'
import type { ReactElement } from 'react'
import { AuthProvider } from '../auth/AuthProvider'

// Renderiza un componente con los providers globales de la app.
export function renderWithProviders(ui: ReactElement, options?: RenderOptions) {
  return render(ui, { wrapper: AuthProvider, ...options })
}
