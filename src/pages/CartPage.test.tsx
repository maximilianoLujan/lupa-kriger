import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { Route, Routes } from 'react-router-dom'
import { useCartStore } from '../cart/store'
import type { ArticlesRepository } from '../data/articles'
import { MockArticlesRepository } from '../data/articles/mock/MockArticlesRepository'
import { intersect } from '../test/intersectionObserver'
import { renderWithProviders } from '../test/render'
import type { AlternativeArticle } from '../types/article'
import { CartPage } from './CartPage'

const repo = new MockArticlesRepository({ delayMs: 0 })

const article: AlternativeArticle = {
  articleCode: 'a',
  particularCode: 'FR-1024',
  description: 'Pastilla freno delantera',
  brandCode: 'FRR',
  brandName: 'FRIC-ROT',
  priceList: 28900,
  stock: {},
}

async function setup(repository: ArticlesRepository = repo) {
  sessionStorage.setItem('auth:user', JSON.stringify({ username: '123', name: 'Gabriel Kriger' }))
  const user = userEvent.setup()
  renderWithProviders(
    <Routes>
      <Route path="/carrito" element={<CartPage repository={repository} />} />
      <Route path="/" element={<p>Página catálogo</p>} />
    </Routes>,
    { route: '/carrito' },
  )
  await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument())
  return { user }
}

describe('CartPage', () => {
  it('tiene el carrito arriba y el historial abajo, con el header de la app', async () => {
    await setup()
    const headings = screen.getAllByRole('heading', { level: 1 }).concat(screen.getAllByRole('heading', { level: 2 }))
    const texts = headings.map((h) => h.textContent)
    expect(texts.indexOf('Tu carrito')).toBeLessThan(texts.indexOf('Historial de pedidos'))
    expect(screen.getByRole('link', { name: 'Ir al carrito' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('button', { name: 'Secciones' })).toBeInTheDocument()
  })

  it('el contenido tiene el mismo ancho que el catálogo', async () => {
    await setup()
    expect(screen.getByRole('main')).toHaveClass('max-w-6xl')
  })

  it('con el carrito vacío invita a buscar y vuelve al catálogo', async () => {
    const { user } = await setup()
    expect(screen.getByRole('heading', { name: 'Tu carrito está vacío' })).toBeInTheDocument()
    await user.click(screen.getByRole('link', { name: 'Buscar repuestos' }))
    expect(screen.getByText('Página catálogo')).toBeInTheDocument()
  })

  it('con items muestra el carrito con cantidades y total', async () => {
    useCartStore.setState({ items: [{ article, quantity: 2 }] })
    await setup()
    const cart = screen.getByRole('region', { name: 'Tu carrito' })
    expect(within(cart).getByText('2 unidades')).toBeInTheDocument()
    expect(within(cart).getByText('FRIC-ROT')).toBeInTheDocument()
    // Subtotal del renglón y total del carrito coinciden con un solo item.
    expect(within(cart).getAllByText('$ 57.800')).toHaveLength(2)
    expect(screen.getByRole('link', { name: 'Ir al carrito, 2 unidades' })).toBeInTheDocument()
  })

  it('el historial carga 10 pedidos y trae más al hacer scroll', async () => {
    await setup()
    const history = screen.getByRole('region', { name: 'Historial de pedidos' })
    expect(within(history).getAllByRole('article')).toHaveLength(10)

    intersect()
    await waitFor(() => expect(within(history).getAllByRole('article')).toHaveLength(20))
    expect(within(history).getByText('Esos son todos tus pedidos.')).toBeInTheDocument()
  })

  it('al enviar el pedido, el historial se actualiza y el nuevo aparece primero', async () => {
    useCartStore.setState({ items: [{ article, quantity: 2 }] })
    const { user } = await setup(new MockArticlesRepository({ delayMs: 0 }))
    expect(screen.getByText('10 de 20 pedidos')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Enviar pedido' }))
    const dialog = screen.getByRole('dialog', { name: 'Enviar pedido' })
    await user.type(within(dialog).getByRole('textbox', { name: 'Tu número de cliente' }), '1001')
    await user.click(within(dialog).getByRole('button', { name: 'Enviar pedido' }))

    expect(await screen.findByText('¡Pedido enviado!')).toBeInTheDocument()
    await waitFor(() => expect(screen.getByText('10 de 21 pedidos')).toBeInTheDocument())
    const history = screen.getByRole('region', { name: 'Historial de pedidos' })
    const nuevo = within(history).getAllByRole('article')[0]
    expect(nuevo).toHaveAccessibleName('Nota de pedido') // sin número hasta que la empresa lo confirme
    expect(within(nuevo).getByText('Pendiente de confirmación')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ir al carrito' })).toBeInTheDocument() // sin contador: carrito vacío
  })

  it('sin pedidos muestra el estado vacío amigable', async () => {
    await setup(new MockArticlesRepository({ delayMs: 0, orders: [] }))
    expect(screen.getByRole('heading', { name: 'Todavía no tenés pedidos' })).toBeInTheDocument()
  })
})
