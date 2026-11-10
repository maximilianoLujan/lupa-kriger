import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { useCartStore } from '../../cart/store'
import type { ArticlesRepository } from '../../data/articles'
import { MOCK_ARTICLES } from '../../data/articles/mock/articles.mock'
import { MockArticlesRepository } from '../../data/articles/mock/MockArticlesRepository'
import { renderWithProviders } from '../../test/render'
import { SendOrderDialog } from './SendOrderDialog'

const repo = new MockArticlesRepository({ delayMs: 0 })

/** Carrito con artículos reales del mock: pastilla Fric-Rot ×2 y Ferodo ×1 (2 × 28.900 + 34.500 = 92.300). */
function seedReal() {
  const [pastilla, ferodo] = MOCK_ARTICLES.flatMap((b) => b.alternatives)
  useCartStore.setState({ items: [{ article: pastilla, quantity: 2 }, { article: ferodo, quantity: 1 }] })
}

function repoWith(createOrder: ArticlesRepository['createOrder']): ArticlesRepository {
  return { search: (p) => repo.search(p), getWarehouses: () => repo.getWarehouses(), getOrders: (p) => repo.getOrders(p), createOrder }
}

function setup(repository: ArticlesRepository = repo) {
  seedReal()
  const onSent = vi.fn()
  const onClose = vi.fn()
  const user = userEvent.setup()
  const view = renderWithProviders(<SendOrderDialog repository={repository} onSent={onSent} onClose={onClose} />)
  const dialog = screen.getByRole('dialog', { name: 'Enviar pedido' })
  const input = within(dialog).getByRole('textbox', { name: 'Tu número de cliente' })
  const send = within(dialog).getByRole('button', { name: 'Enviar pedido' })
  return { onSent, onClose, user, dialog, input, send, view }
}

describe('SendOrderDialog', () => {
  it('muestra el resumen del carrito y arranca con el foco en el número de cliente', () => {
    const { dialog, input } = setup()
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(within(dialog).getByText(/3 unidades/)).toBeInTheDocument()
    expect(within(dialog).getByText('$ 92.300')).toBeInTheDocument()
    expect(within(dialog).getByText(/figura en tus facturas o remitos/)).toBeInTheDocument()
    expect(input).toHaveFocus()
    expect(input).toHaveValue('')
  })

  it('se cierra con Cancelar, con la X, con Escape y tocando el fondo, sin enviar nada', async () => {
    const createOrder = vi.fn()
    const { onClose, onSent, user, dialog } = setup(repoWith(createOrder))
    await user.click(within(dialog).getByRole('button', { name: 'Cancelar' }))
    await user.click(within(dialog).getByRole('button', { name: 'Cerrar' }))
    await user.keyboard('{Escape}')
    await user.click(dialog)
    expect(onClose).toHaveBeenCalledTimes(4)
    expect(createOrder).not.toHaveBeenCalled()
    expect(onSent).not.toHaveBeenCalled()
  })

  it('sin número de cliente no envía: avisa y marca el campo', async () => {
    const createOrder = vi.fn()
    const { user, input, send } = setup(repoWith(createOrder))
    await user.click(send)
    expect(screen.getByRole('alert')).toHaveTextContent('Ingresá tu número de cliente para enviar el pedido.')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveFocus()
    expect(createOrder).not.toHaveBeenCalled()

    await user.type(input, '1001')
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('envía con Enter el número y los códigos con sus cantidades, vacía el carrito y avisa al padre', async () => {
    const createOrder = vi.fn((input) => repo.createOrder(input))
    const { onSent, user, input } = setup(repoWith(createOrder))

    await user.type(input, ' 1001 {Enter}')

    await waitFor(() => expect(onSent).toHaveBeenCalledTimes(1))
    expect(createOrder).toHaveBeenCalledWith({
      customerCode: '1001',
      items: [
        { code: 'FR-1024', quantity: 2 },
        { code: 'HQF-2234C', quantity: 1 },
      ],
    })
    expect(onSent.mock.calls[0][0]).toMatchObject({ status: 'pending', total: 92300 })
    expect(useCartStore.getState().items).toEqual([])
  })

  it('recuerda el número de cliente del último pedido enviado', async () => {
    const first = setup()
    await first.user.type(first.input, '1002')
    await first.user.click(first.send)
    await waitFor(() => expect(first.onSent).toHaveBeenCalled())
    first.view.unmount()

    const second = setup()
    expect(second.input).toHaveValue('1002')
  })

  it('un número que no existe muestra el mensaje de la empresa, conserva el carrito y deja corregir', async () => {
    const { onSent, user, input, send } = setup()
    await user.type(input, '9999')
    await user.click(send)

    expect(await screen.findByRole('alert')).toHaveTextContent('No encontramos un cliente con el número 9999. Revisalo o consultá a la empresa.')
    expect(useCartStore.getState().items).toHaveLength(2)
    expect(onSent).not.toHaveBeenCalled()

    await user.clear(input)
    await user.type(input, '1001')
    await user.click(send)
    await waitFor(() => expect(onSent).toHaveBeenCalledTimes(1))
  })

  it('mientras envía no se puede cerrar ni volver a enviar', async () => {
    let resolve!: (v: Awaited<ReturnType<ArticlesRepository['createOrder']>>) => void
    const pending = repoWith(() => new Promise((r) => (resolve = r)))
    const { onClose, user, input, send, dialog } = setup(pending)
    await user.type(input, '1001')
    await user.click(send)

    expect(screen.getByRole('button', { name: 'Enviando…' })).toBeDisabled()
    expect(within(dialog).getByRole('button', { name: 'Cancelar' })).toBeDisabled()
    await user.click(dialog)
    expect(onClose).not.toHaveBeenCalled()

    resolve(await repo.createOrder({ customerCode: '1001', items: [{ code: 'FR-1024', quantity: 1 }] }))
    await waitFor(() => expect(useCartStore.getState().items).toEqual([]))
  })
})
