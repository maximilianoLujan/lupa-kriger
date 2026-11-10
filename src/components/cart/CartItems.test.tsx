import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { useCartStore } from '../../cart/store'
import type { ArticlesRepository } from '../../data/articles'
import { MOCK_ARTICLES } from '../../data/articles/mock/articles.mock'
import { MockArticlesRepository } from '../../data/articles/mock/MockArticlesRepository'
import { renderWithProviders } from '../../test/render'
import type { AlternativeArticle } from '../../types/article'
import { CartItems } from './CartItems'

const base: AlternativeArticle = { articleCode: '', particularCode: '', description: '', brandCode: '', brandName: '', priceList: 0, stock: {} }
const repo = new MockArticlesRepository({ delayMs: 0 })

function seed() {
  useCartStore.setState({
    items: [
      { article: { ...base, articleCode: 'a', particularCode: 'FR-1', brandName: 'FRIC-ROT', description: 'Pastilla', priceList: 1000 }, quantity: 2 },
      { article: { ...base, articleCode: 'b', particularCode: 'HQF', brandName: 'FERODO', priceList: 500 }, quantity: 1 },
    ],
  })
}

/** Carrito con artículos reales del mock, para poder enviarlo. */
function seedReal() {
  const [pastilla, filtro] = MOCK_ARTICLES.flatMap((b) => b.alternatives)
  useCartStore.setState({ items: [{ article: pastilla, quantity: 2 }, { article: filtro, quantity: 1 }] })
}

describe('CartItems', () => {
  it('vacío invita a buscar repuestos', () => {
    renderWithProviders(<CartItems repository={repo} />)
    expect(screen.getByRole('heading', { name: 'Tu carrito está vacío' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Buscar repuestos' })).toHaveAttribute('href', '/')
    expect(screen.queryByRole('button', { name: /enviar pedido/i })).not.toBeInTheDocument()
  })

  it('lista los items con subtotal, total y el botón de enviar habilitado', () => {
    seed()
    renderWithProviders(<CartItems repository={repo} />)
    expect(screen.getByText('FRIC-ROT')).toBeInTheDocument()
    expect(screen.getByText('Pastilla')).toBeInTheDocument()
    expect(screen.getByText('$ 2.000')).toBeInTheDocument()
    expect(screen.getByText('$ 2.500')).toBeInTheDocument()
    expect(screen.getByText('Total · 3 unidades')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Enviar pedido' })).toBeEnabled()
    expect(screen.getByRole('link', { name: 'Seguir buscando' })).toHaveAttribute('href', '/')
  })

  it('suma, resta, quita y vacía', async () => {
    seed()
    renderWithProviders(<CartItems repository={repo} />)
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
    renderWithProviders(<CartItems repository={repo} />)
    await userEvent.click(screen.getByRole('button', { name: 'Vaciar carrito' }))
    expect(useCartStore.getState().items).toEqual([])
    expect(screen.getByRole('heading', { name: 'Tu carrito está vacío' })).toBeInTheDocument()
  })

  it('enviar el pedido manda los códigos con sus cantidades, vacía el carrito y confirma con el número', async () => {
    seedReal()
    const createOrder = vi.fn((input) => repo.createOrder(input))
    const spied: ArticlesRepository = { search: (p) => repo.search(p), getWarehouses: () => repo.getWarehouses(), getOrders: (p) => repo.getOrders(p), createOrder }
    renderWithProviders(<CartItems repository={spied} />)
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: 'Enviar pedido' }))

    const confirmation = await screen.findByRole('status')
    expect(confirmation).toHaveTextContent('¡Pedido enviado!')
    expect(confirmation).toHaveTextContent('Nota de pedido 00000121 · 3 unidades · $ 92.300') // 2 × 28.900 + 34.500
    expect(createOrder).toHaveBeenCalledWith({
      items: [
        { code: 'FR-1024', quantity: 2 },
        { code: 'HQF-2234C', quantity: 1 },
      ],
    })
    expect(useCartStore.getState().items).toEqual([])

    await user.click(screen.getByRole('button', { name: 'Listo' }))
    expect(screen.getByRole('heading', { name: 'Tu carrito está vacío' })).toBeInTheDocument()
  })

  it('si el envío falla, muestra el motivo y conserva el carrito para reintentar', async () => {
    seedReal()
    let fail = true
    const flaky: ArticlesRepository = {
      search: (p) => repo.search(p),
      getWarehouses: () => repo.getWarehouses(),
      getOrders: (p) => repo.getOrders(p),
      createOrder: async (input) => {
        if (fail) throw new Error('Tu usuario todavía no está vinculado a una ficha de cliente')
        return repo.createOrder(input)
      },
    }
    renderWithProviders(<CartItems repository={flaky} />)
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: 'Enviar pedido' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Tu usuario todavía no está vinculado a una ficha de cliente')
    expect(useCartStore.getState().items).toHaveLength(2)
    expect(screen.getByRole('button', { name: 'Enviar pedido' })).toBeEnabled()

    fail = false
    await user.click(screen.getByRole('button', { name: 'Enviar pedido' }))
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('¡Pedido enviado!'))
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
