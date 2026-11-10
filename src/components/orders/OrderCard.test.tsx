import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import type { Order } from '../../types/order'
import { OrderCard } from './OrderCard'

const order: Order = {
  id: '120',
  number: 'Nota de pedido 00000120',
  createdAt: '2026-11-09T10:12:00-03:00',
  status: 'pending',
  items: [
    { articleCode: 'a', particularCode: 'FR-1024', brandName: 'FRIC-ROT', description: 'Pastilla freno', quantity: 2, unitPrice: 28900, total: 57800 },
    { articleCode: 'b', particularCode: 'W 712/75', brandName: 'MANN', description: 'Filtro aceite', quantity: 4, unitPrice: 9800, total: 39200 },
  ],
  total: 97000,
}

describe('OrderCard', () => {
  it('muestra número, fecha, estado, cantidades y total', () => {
    render(<OrderCard order={order} />)
    const card = screen.getByRole('article', { name: 'Nota de pedido 00000120' })
    expect(within(card).getByText('Nota de pedido 00000120')).toBeInTheDocument()
    expect(within(card).getByText('Pendiente de confirmación')).toBeInTheDocument()
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

  it('el importe del renglón es el que manda la API, no cantidad por precio', async () => {
    const conDescuento = { ...order, items: [{ ...order.items[0], total: 50000 }] }
    render(<OrderCard order={conDescuento} />)
    await userEvent.click(screen.getByRole('button', { expanded: false }))
    expect(screen.getByText('$ 50.000')).toBeInTheDocument()
    expect(screen.queryByText('$ 57.800')).not.toBeInTheDocument()
  })

  it('usa singular para un solo artículo y una sola unidad', () => {
    render(<OrderCard order={{ ...order, items: [{ ...order.items[0], quantity: 1 }] }} />)
    expect(screen.getByText(/1 artículo · 1 unidad$/)).toBeInTheDocument()
  })

  it('los estados en curso llevan el rojo de marca, los finales van en neutro y los cancelados tachados', () => {
    const { rerender } = render(<OrderCard order={{ ...order, status: 'completed' }} />)
    expect(screen.getByText('Completado')).toHaveClass('bg-canvas')
    rerender(<OrderCard order={{ ...order, status: 'cancelled' }} />)
    expect(screen.getByText('Cancelado')).toHaveClass('line-through')
    rerender(<OrderCard order={{ ...order, status: 'preparing' }} />)
    expect(screen.getByText('En preparación')).toHaveClass('ring-brand')
    rerender(<OrderCard order={{ ...order, status: 'partial' }} />)
    expect(screen.getByText('Entrega parcial')).toHaveClass('ring-brand')
    rerender(<OrderCard order={{ ...order, status: 'confirmed' }} />)
    expect(screen.getByText('Confirmado')).toHaveClass('ring-brand')
  })
})
