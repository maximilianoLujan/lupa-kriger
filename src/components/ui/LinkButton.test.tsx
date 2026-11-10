import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderWithProviders } from '../../test/render'
import { Button } from './Button'
import { LinkButton } from './LinkButton'

describe('LinkButton', () => {
  it('es un link con el mismo aspecto que el Button de la misma variante', () => {
    renderWithProviders(
      <>
        <LinkButton to="/carrito" variant="secondary" size="sm">
          Ir
        </LinkButton>
        <Button variant="secondary" size="sm">
          Acción
        </Button>
      </>,
    )
    const link = screen.getByRole('link', { name: 'Ir' })
    expect(link).toHaveAttribute('href', '/carrito')
    expect(link.className).toBe(screen.getByRole('button', { name: 'Acción' }).className)
  })

  it('por defecto es primario y de ancho completo', () => {
    renderWithProviders(<LinkButton to="/">Ir</LinkButton>)
    expect(screen.getByRole('link', { name: 'Ir' })).toHaveClass('bg-brand', 'w-full')
  })
})
