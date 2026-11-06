import { render, type RenderOptions } from '@testing-library/react'
import type { ReactElement } from 'react'
import { Providers } from './Providers'

// Renderiza un componente con los providers globales de la app.
export function renderWithProviders(ui: ReactElement, options?: RenderOptions) {
  return render(ui, { wrapper: Providers, ...options })
}
