import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { formatDate } from '../../utils/formatDate'
import { PriceTag } from './PriceTag'

const daysAgo = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

describe('PriceTag', () => {
  it('muestra el precio sin resaltar si cambió hace poco o no se sabe cuándo', () => {
    const { rerender } = render(<PriceTag price={28900} updatedAt={daysAgo(5)} />)
    expect(screen.getByText('$ 28.900')).toHaveClass('text-emerald-600')
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()

    rerender(<PriceTag price={28900} />)
    expect(screen.getByText('$ 28.900')).not.toHaveClass('bg-butter')
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })

  it('resalta el precio que lleva más de 30 días sin modificarse y lo explica en un tooltip', () => {
    const updatedAt = daysAgo(45)
    render(<PriceTag price={34500} updatedAt={updatedAt} />)

    const price = screen.getByText('$ 34.500')
    expect(price).toHaveClass('bg-butter')
    const tooltip = screen.getByRole('tooltip')
    expect(tooltip).toHaveTextContent(`Precio sin modificar hace 45 días (desde el ${formatDate(updatedAt)}).`)
    // El tooltip describe al precio y se puede alcanzar con el teclado (o tocándolo en el celular).
    expect(price).toHaveAttribute('aria-describedby', tooltip.id)
    expect(price).toHaveAttribute('tabindex', '0')
  })

  it('a los 30 días justos todavía no se resalta', () => {
    render(<PriceTag price={100} updatedAt={daysAgo(30)} />)
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })
})
