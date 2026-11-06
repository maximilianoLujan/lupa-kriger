import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { StockBadge } from './StockBadge'

describe('StockBadge', () => {
  it('más de 9 unidades muestra +9 en menta', () => {
    render(<StockBadge quantity={30} warehouse="GUA" />)
    const badge = screen.getByRole('img', { name: 'GUA: 30 en stock' })
    expect(badge).toHaveTextContent('+9')
    expect(badge.className).toContain('bg-mint')
  })

  it('entre 6 y 9 muestra la cantidad en menta', () => {
    render(<StockBadge quantity={7} warehouse="GUA" />)
    const badge = screen.getByRole('img')
    expect(badge).toHaveTextContent('7')
    expect(badge.className).toContain('bg-mint')
  })

  it('entre 1 y 5 muestra la cantidad en manteca', () => {
    render(<StockBadge quantity={3} warehouse="DEP" />)
    const badge = screen.getByRole('img', { name: 'DEP: 3 en stock' })
    expect(badge).toHaveTextContent('3')
    expect(badge.className).toContain('bg-butter')
  })

  it('sin stock muestra NO en rosa', () => {
    render(<StockBadge quantity={0} warehouse="GUA" />)
    const badge = screen.getByRole('img', { name: 'GUA: sin stock' })
    expect(badge).toHaveTextContent('NO')
    expect(badge.className).toContain('bg-brand-soft')
  })
})
