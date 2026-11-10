import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { useCartStore } from '../../cart/store'
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
  it('vacío invita a buscar repuestos y no muestra el botón de enviar', () => {
    renderWithProviders(<CartItems repository={repo} />)
    expect(screen.getByRole('heading', { name: 'Tu carrito está vacío' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Buscar repuestos' })).toHaveAttribute('href', '/')
    expect(screen.queryByRole('button', { name: /enviar pedido/i })).not.toBeInTheDocument()
  })

  it('lista los items con subtotal y totales, sin formulario a la vista, y el botón flotante de enviar', () => {
    seed()
    renderWithProviders(<CartItems repository={repo} />)
    expect(screen.getByText('FRIC-ROT')).toBeInTheDocument()
    expect(screen.getByText('Pastilla')).toBeInTheDocument()
    expect(screen.getByText('$ 2.000')).toBeInTheDocument()
    expect(screen.getByText('$ 2.500')).toBeInTheDocument()
    expect(screen.getByText('Total · 3 unidades')).toBeInTheDocument()
    expect(screen.queryByRole('textbox', { name: 'Tu número de cliente' })).not.toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    const fab = screen.getByRole('button', { name: 'Enviar pedido' })
    expect(fab.parentElement).toHaveClass('fixed', 'right-4', 'bottom-4')
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

  it('el botón flotante abre el modal; Cancelar lo cierra y deja el carrito como estaba', async () => {
    seedReal()
    renderWithProviders(<CartItems repository={repo} />)
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: 'Enviar pedido' }))
    const dialog = screen.getByRole('dialog', { name: 'Enviar pedido' })
    expect(within(dialog).getByRole('textbox', { name: 'Tu número de cliente' })).toHaveFocus()

    await user.click(within(dialog).getByRole('button', { name: 'Cancelar' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(useCartStore.getState().items).toHaveLength(2)
    expect(screen.getByRole('button', { name: 'Enviar pedido' })).toBeInTheDocument()
  })

  it('al enviar desde el modal, el carrito se vacía y queda la confirmación', async () => {
    seedReal()
    renderWithProviders(<CartItems repository={repo} />)
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: 'Enviar pedido' }))
    const dialog = screen.getByRole('dialog', { name: 'Enviar pedido' })
    await user.type(within(dialog).getByRole('textbox', { name: 'Tu número de cliente' }), '1001')
    await user.click(within(dialog).getByRole('button', { name: 'Enviar pedido' }))

    const confirmation = await screen.findByRole('status')
    expect(confirmation).toHaveTextContent('¡Pedido enviado!')
    expect(confirmation).toHaveTextContent('3 unidades · $ 92.300') // 2 × 28.900 + 34.500
    expect(confirmation).toHaveTextContent('pendiente de confirmación')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(useCartStore.getState().items).toEqual([])

    await user.click(screen.getByRole('button', { name: 'Listo' }))
    expect(screen.getByRole('heading', { name: 'Tu carrito está vacío' })).toBeInTheDocument()
  })

  it('un número de cliente inexistente deja el error en el modal y el carrito intacto', async () => {
    seedReal()
    renderWithProviders(<CartItems repository={repo} />)
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: 'Enviar pedido' }))
    const dialog = screen.getByRole('dialog', { name: 'Enviar pedido' })
    await user.type(within(dialog).getByRole('textbox', { name: 'Tu número de cliente' }), '9999')
    await user.click(within(dialog).getByRole('button', { name: 'Enviar pedido' }))

    await waitFor(() => expect(within(dialog).getByRole('alert')).toHaveTextContent('No encontramos un cliente con el número 9999'))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(useCartStore.getState().items).toHaveLength(2)
  })
})
