import { useState } from 'react'
import { useCart } from '../../cart/useCart'
import type { ArticlesRepository } from '../../data/articles'
import { useCreateOrder } from '../../hooks/useCreateOrder'
import { errorMessage } from '../../lib/http'
import type { Order } from '../../types/order'
import { formatPrice } from '../../utils/formatPrice'
import { QuantityStepper } from '../catalog/QuantityStepper'
import { Button } from '../ui/Button'
import { LinkButton } from '../ui/LinkButton'

interface CartItemsProps {
  repository: ArticlesRepository
}

/**
 * Contenido del carrito en la pantalla `/carrito`: renglones con cantidad editable, total y el envío del pedido.
 * Al enviarse, el carrito se vacía y queda la confirmación con el número de pedido. Vacío, invita a volver al catálogo.
 */
export function CartItems({ repository }: CartItemsProps) {
  const { items, count, total, setQuantity, remove, clear } = useCart()
  const createOrder = useCreateOrder(repository)
  const [sent, setSent] = useState<Order | null>(null)

  if (sent) return <OrderSent order={sent} onDismiss={() => setSent(null)} />
  if (items.length === 0) return <CartEmpty />

  function send() {
    createOrder.mutate(
      { items: items.map(({ article, quantity }) => ({ code: article.particularCode, quantity })) },
      {
        onSuccess: (order) => {
          clear()
          setSent(order)
        },
      },
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-line">
      <ul className="divide-y divide-line">
        {items.map(({ article, quantity }) => (
          <li key={article.articleCode} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-ink">{article.brandName}</p>
              <p className="truncate text-xs font-semibold text-ink-soft tabular-nums">{article.particularCode}</p>
              <p className="truncate text-xs text-ink-soft">{article.description}</p>
            </div>
            <div className="flex items-center justify-between gap-3 sm:justify-end">
              <QuantityStepper
                size="sm"
                value={quantity}
                code={article.particularCode}
                onChange={(q) => setQuantity(article.articleCode, q)}
              />
              <p className="w-24 text-right text-sm font-bold text-ink tabular-nums">
                $ {formatPrice(article.priceList * quantity)}
              </p>
              <button
                type="button"
                aria-label={`Quitar ${article.particularCode}`}
                onClick={() => remove(article.articleCode)}
                className="rounded-full p-2 text-ink-soft transition hover:bg-canvas hover:text-brand-text"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-4 w-4" aria-hidden>
                  <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
                </svg>
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="space-y-3 border-t border-line bg-canvas/60 p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-ink-soft">
            Total · {count} {count === 1 ? 'unidad' : 'unidades'}
          </span>
          <span className="text-xl font-bold text-ink tabular-nums">$ {formatPrice(total)}</span>
        </div>
        {createOrder.isError && (
          <p role="alert" className="rounded-xl bg-brand-soft px-4 py-3 text-sm text-brand-text">
            {errorMessage(createOrder.error, 'No se pudo enviar el pedido. Probá de nuevo.')}
          </p>
        )}
        <div className="flex flex-col gap-2 sm:flex-row-reverse">
          <Button type="button" onClick={send} loading={createOrder.isPending} className="sm:flex-1">
            {createOrder.isPending ? 'Enviando…' : 'Enviar pedido'}
          </Button>
          <LinkButton to="/" variant="secondary" className="sm:flex-1">
            Seguir buscando
          </LinkButton>
        </div>
        <button
          type="button"
          onClick={clear}
          disabled={createOrder.isPending}
          className="w-full text-center text-xs font-medium text-ink-soft transition hover:text-brand-text disabled:opacity-60"
        >
          Vaciar carrito
        </button>
      </div>
    </div>
  )
}

function OrderSent({ order, onDismiss }: { order: Order; onDismiss: () => void }) {
  const units = order.items.reduce((n, i) => n + i.quantity, 0)
  return (
    <div role="status" className="rounded-2xl bg-white px-6 py-10 text-center shadow-sm ring-1 ring-line">
      <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand text-white shadow-md shadow-brand/25">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8" aria-hidden>
          <path d="m5 12.5 4.5 4.5L19 7.5" />
        </svg>
      </span>
      <h2 className="mt-4 text-lg font-bold text-ink">¡Pedido enviado!</h2>
      <p className="mt-1 text-sm font-semibold text-ink tabular-nums">
        {order.number} · {units} {units === 1 ? 'unidad' : 'unidades'} · $ {formatPrice(order.total)}
      </p>
      <p className="mx-auto mt-2 max-w-sm text-sm text-ink-soft">
        La empresa ya lo recibió. Lo vas a ver acá abajo, en el historial, con su estado a medida que avance.
      </p>
      <div className="mx-auto mt-6 flex max-w-sm flex-col gap-2 sm:flex-row-reverse">
        <LinkButton to="/" size="sm" className="sm:flex-1">
          Seguir buscando
        </LinkButton>
        <Button type="button" variant="secondary" size="sm" onClick={onDismiss} className="sm:flex-1">
          Listo
        </Button>
      </div>
    </div>
  )
}

function CartEmpty() {
  return (
    <div className="rounded-2xl bg-white px-6 py-10 text-center shadow-sm ring-1 ring-line">
      <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-canvas text-brand ring-1 ring-line">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8" aria-hidden>
          <circle cx="9" cy="20" r="1" />
          <circle cx="18" cy="20" r="1" />
          <path d="M2 3h3l2.5 11h11L21 7H6.2" />
        </svg>
      </span>
      <h2 className="mt-4 text-lg font-bold text-ink">Tu carrito está vacío</h2>
      <p className="mx-auto mt-1 max-w-sm text-sm text-ink-soft">
        Buscá un repuesto por código, marca o modelo de auto y agregalo con el botón <strong className="font-semibold text-ink">+</strong> de
        cada fila. Lo que sumes queda guardado acá.
      </p>
      <LinkButton to="/" size="sm" className="mx-auto mt-6">
        Buscar repuestos
      </LinkButton>
    </div>
  )
}
