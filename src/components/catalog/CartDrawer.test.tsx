import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { renderWithProviders } from '../../test/render'
import { CartDrawer } from './CartDrawer'

function seed() {
  sessionStorage.setItem(
    'cart:items',
    JSON.stringify([
      { article: { articleCode: 'a', particularCode: 'FR-1', brandName: 'FRIC-ROT', priceList: 1000, stock: {} }, quantity: 2 },
      { article: { articleCode: 'b', particularCode: 'HQF', brandName: 'FERODO', priceList: 500, stock: {} }, quantity: 1 },
    ]),
  )
}

describe('CartDrawer', () => {
  it('cerrado no renderiza nada', () => {
    renderWithProviders(<CartDrawer open={false} onClose={() => {}} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('vacío muestra el mensaje y el botón de enviar deshabilitado', () => {
    renderWithProviders(<CartDrawer open onClose={() => {}} />)
    expect(screen.getByText('Todavía no agregaste repuestos.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /enviar pedido/i })).toBeDisabled()
    expect(screen.getByText('$ 0')).toBeInTheDocument()
  })

  it('lista los items con subtotal y total', () => {
    seed()
    renderWithProviders(<CartDrawer open onClose={() => {}} />)
    expect(screen.getByRole('dialog', { name: /carrito/i })).toBeInTheDocument()
    expect(screen.getByText('3 u.')).toBeInTheDocument()
    expect(screen.getByText('$ 2.000')).toBeInTheDocument()
    expect(screen.getByText('$ 2.500')).toBeInTheDocument()
  })

  it('suma, resta, quita y vacía', async () => {
    seed()
    renderWithProviders(<CartDrawer open onClose={() => {}} />)
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: 'Sumar FR-1' }))
    expect(screen.getByLabelText('Cantidad FR-1')).toHaveTextContent('3')

    await user.click(screen.getByRole('button', { name: 'Restar HQF' }))
    expect(screen.queryByText('FERODO')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Quitar FR-1' }))
    expect(screen.getByText('Todavía no agregaste repuestos.')).toBeInTheDocument()

    sessionStorage.clear()
  })

  it('vaciar carrito saca todo', async () => {
    seed()
    renderWithProviders(<CartDrawer open onClose={() => {}} />)
    await userEvent.click(screen.getByRole('button', { name: 'Vaciar carrito' }))
    expect(screen.getByText('Todavía no agregaste repuestos.')).toBeInTheDocument()
  })

  it('cierra con la X, con el fondo y con Escape', async () => {
    const onClose = vi.fn()
    renderWithProviders(<CartDrawer open onClose={onClose} />)
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: 'Cerrar' }))
    await user.click(screen.getByRole('button', { name: 'Cerrar carrito' }))
    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledTimes(3)
  })
})
