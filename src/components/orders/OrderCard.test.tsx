import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import type { Order } from '../../types/order'
import { OrderCard } from './OrderCard'

const order: Order = {
  id: '1',
  number: 'P-000120',
  createdAt: '2026-11-09T10:12:00-03:00',
  status: 'pendiente',
  items: [
    { articleCode: 'a', particularCode: 'FR-1024', brandName: 'FRIC-ROT', description: 'Pastilla freno', quantity: 2, unitPrice: 28900 },
    { articleCode: 'b', particularCode: 'W 712/75', brandName: 'MANN', description: 'Filtro aceite', quantity: 4, unitPrice: 9800 },
  ],
  total: 97000,
}

describe('OrderCard', () => {
  it('muestra número, fecha, estado, cantidades y total', () => {
    render(<OrderCard order={order} />)
    const card = screen.getByRole('article', { name: 'Pedido P-000120' })
    expect(within(card).getByText('P-000120')).toBeInTheDocument()
    expect(within(card).getByText('Pendiente')).toBeInTheDocument()
    expect(within(card).getByText(/9 nov 2026/)).toBeInTheDocument()
    expect(within(card).getByText(/2 artículos · 6 unidades/)).toBeInTheDocument()
    expect(within(card).getByText('$ 97.000')).toBeInTheDocument()
  })

  it('despliega el detalle de renglones al tocar y lo vuelve a ocultar', async () => {
    render(<OrderCard order={order} />)
    const toggle = screen.getByRole('button', { expanded: false })
    expect(screen.queryByText('Pastilla freno')).not.toBeInTheDocument()

    await userEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText('Pastilla freno')).toBeInTheDocument()
    expect(screen.getByText('2 × $ 28.900')).toBeInTheDocument()
    expect(screen.getByText('$ 57.800')).toBeInTheDocument()
    expect(screen.getByText('$ 39.200')).toBeInTheDocument()

    await userEvent.click(toggle)
    expect(screen.queryByText('Pastilla freno')).not.toBeInTheDocument()
  })

  it('usa singular para un solo artículo y una sola unidad', () => {
    render(<OrderCard order={{ ...order, items: [{ ...order.items[0], quantity: 1 }] }} />)
    expect(screen.getByText(/1 artículo · 1 unidad$/)).toBeInTheDocument()
  })

  it('los estados finales se ven en neutro y los cancelados tachados', () => {
    const { rerender } = render(<OrderCard order={{ ...order, status: 'entregado' }} />)
    expect(screen.getByText('Entregado')).toHaveClass('bg-canvas')
    rerender(<OrderCard order={{ ...order, status: 'cancelado' }} />)
    expect(screen.getByText('Cancelado')).toHaveClass('line-through')
    rerender(<OrderCard order={{ ...order, status: 'enviado' }} />)
    expect(screen.getByText('Enviado')).toHaveClass('ring-brand')
  })
})
