import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { useCartStore } from '../../cart/store'
import { renderWithProviders } from '../../test/render'
import type { AlternativeArticle } from '../../types/article'
import { CartItems } from './CartItems'

const base: AlternativeArticle = { articleCode: '', particularCode: '', description: '', brandCode: '', brandName: '', priceList: 0, stock: {} }

function seed() {
  useCartStore.setState({
    items: [
      { article: { ...base, articleCode: 'a', particularCode: 'FR-1', brandName: 'FRIC-ROT', description: 'Pastilla', priceList: 1000 }, quantity: 2 },
      { article: { ...base, articleCode: 'b', particularCode: 'HQF', brandName: 'FERODO', priceList: 500 }, quantity: 1 },
    ],
  })
}

describe('CartItems', () => {
  it('vacío invita a buscar repuestos', () => {
    renderWithProviders(<CartItems />)
    expect(screen.getByRole('heading', { name: 'Tu carrito está vacío' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Buscar repuestos' })).toHaveAttribute('href', '/')
    expect(screen.queryByRole('button', { name: /enviar pedido/i })).not.toBeInTheDocument()
  })

  it('lista los items con subtotal, total y enviar deshabilitado', () => {
    seed()
    renderWithProviders(<CartItems />)
    expect(screen.getByText('FRIC-ROT')).toBeInTheDocument()
    expect(screen.getByText('Pastilla')).toBeInTheDocument()
    expect(screen.getByText('$ 2.000')).toBeInTheDocument()
    expect(screen.getByText('$ 2.500')).toBeInTheDocument()
    expect(screen.getByText('Total · 3 unidades')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /enviar pedido/i })).toBeDisabled()
    expect(screen.getByRole('link', { name: 'Seguir buscando' })).toHaveAttribute('href', '/')
  })

  it('suma, resta, quita y vacía', async () => {
    seed()
    renderWithProviders(<CartItems />)
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: 'Sumar FR-1' }))
    expect(screen.getByRole('textbox', { name: 'Cantidad FR-1' })).toHaveValue('3')

    await user.click(screen.getByRole('button', { name: 'Restar HQF' }))
    expect(screen.queryByText('FERODO')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Quitar FR-1' }))
    expect(screen.getByRole('heading', { name: 'Tu carrito está vacío' })).toBeInTheDocument()
  })

  it('vaciar carrito saca todo', async () => {
    seed()
    renderWithProviders(<CartItems />)
    await userEvent.click(screen.getByRole('button', { name: 'Vaciar carrito' }))
    expect(useCartStore.getState().items).toEqual([])
    expect(screen.getByRole('heading', { name: 'Tu carrito está vacío' })).toBeInTheDocument()
  })
})
