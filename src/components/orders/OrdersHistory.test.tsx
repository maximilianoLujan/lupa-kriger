import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { ArticlesRepository } from '../../data/articles'
import { MockArticlesRepository } from '../../data/articles/mock/MockArticlesRepository'
import { intersect, observedTargets } from '../../test/intersectionObserver'
import { renderWithProviders } from '../../test/render'
import { OrdersHistory } from './OrdersHistory'

const repo = new MockArticlesRepository({ delayMs: 0 })

async function setup(repository: ArticlesRepository = repo) {
  const user = userEvent.setup()
  renderWithProviders(<OrdersHistory repository={repository} />)
  await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument())
  return { user }
}

describe('OrdersHistory', () => {
  it('muestra la primera página con el contador y el centinela del scroll infinito', async () => {
    await setup()
    expect(screen.getAllByRole('article')).toHaveLength(10)
    expect(screen.getByText('10 de 20 pedidos')).toBeInTheDocument()
    expect(screen.getByRole('article', { name: 'Pedido P-000120' })).toBeInTheDocument()
    expect(screen.getByTestId('orders-sentinel')).toBeInTheDocument()
    expect(observedTargets()).toContain(screen.getByTestId('orders-sentinel'))
    expect(screen.queryByRole('button', { name: 'Cargar más pedidos' })).not.toBeInTheDocument()
  })

  it('al llegar al final carga la página siguiente y avisa cuando no hay más', async () => {
    await setup()
    intersect()
    await waitFor(() => expect(screen.getAllByRole('article')).toHaveLength(20))
    expect(screen.getByText('20 de 20 pedidos')).toBeInTheDocument()
    expect(screen.getByText('Esos son todos tus pedidos.')).toBeInTheDocument()
    expect(screen.queryByTestId('orders-sentinel')).not.toBeInTheDocument()
    expect(observedTargets()).toHaveLength(0)
  })

  it('sin IntersectionObserver muestra un botón para cargar más', async () => {
    vi.stubGlobal('IntersectionObserver', undefined)
    try {
      const { user } = await setup()
      await user.click(screen.getByRole('button', { name: 'Cargar más pedidos' }))
      await waitFor(() => expect(screen.getAllByRole('article')).toHaveLength(20))
    } finally {
      vi.unstubAllGlobals()
    }
  })

  it('sin pedidos explica qué va a aparecer acá', async () => {
    await setup(new MockArticlesRepository({ delayMs: 0, orders: [] }))
    expect(screen.getByRole('heading', { name: 'Todavía no tenés pedidos' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ir al catálogo' })).toHaveAttribute('href', '/')
    expect(screen.queryByRole('article')).not.toBeInTheDocument()
    expect(screen.queryByText(/de 0 pedidos/)).not.toBeInTheDocument()
  })

  it('muestra el error y reintenta', async () => {
    let fail = true
    const flaky: ArticlesRepository = {
      search: (p) => repo.search(p),
      getWarehouses: () => repo.getWarehouses(),
      getOrders: async (params) => {
        if (fail) throw new Error('Sin conexión')
        return repo.getOrders(params)
      },
    }
    const { user } = await setup(flaky)
    expect(screen.getByRole('alert')).toHaveTextContent('Sin conexión')
    expect(screen.queryByRole('heading', { name: 'Todavía no tenés pedidos' })).not.toBeInTheDocument()

    fail = false
    await user.click(screen.getByRole('button', { name: 'Reintentar' }))
    await waitFor(() => expect(screen.getAllByRole('article')).toHaveLength(10))
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
