import { useId, useState } from 'react'
import type { Order } from '../../types/order'
import { formatDate } from '../../utils/formatDate'
import { formatPrice } from '../../utils/formatPrice'
import { OrderStatusChip } from './OrderStatusChip'

/** Un pedido del historial: número, fecha, estado y total; el detalle de renglones se despliega al tocar. */
export function OrderCard({ order }: { order: Order }) {
  const [open, setOpen] = useState(false)
  const detailId = useId()
  const units = order.items.reduce((n, i) => n + i.quantity, 0)

  return (
    <article aria-label={`Pedido ${order.number}`} className="rounded-2xl bg-white shadow-sm ring-1 ring-line">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={detailId}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 rounded-2xl p-4 text-left transition hover:bg-canvas/60 focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none"
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-sm font-bold text-ink tabular-nums">{order.number}</span>
            <OrderStatusChip status={order.status} />
          </div>
          <p className="mt-0.5 text-xs text-ink-soft">
            <time dateTime={order.createdAt}>{formatDate(order.createdAt)}</time>
            {' · '}
            {order.items.length} {order.items.length === 1 ? 'artículo' : 'artículos'}
            {' · '}
            {units} {units === 1 ? 'unidad' : 'unidades'}
          </p>
        </div>
        <span className="text-sm font-bold whitespace-nowrap text-ink tabular-nums sm:text-base">$ {formatPrice(order.total)}</span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`h-4 w-4 shrink-0 text-ink-soft transition ${open ? 'rotate-180' : ''}`}
          aria-hidden
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <ul id={detailId} className="divide-y divide-line border-t border-line px-4">
          {order.items.map((item) => (
            <li key={item.articleCode} className="flex items-center gap-3 py-2.5 text-xs">
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-ink">
                  {item.brandName} <span className="font-medium text-ink-soft tabular-nums">{item.particularCode}</span>
                </p>
                <p className="truncate text-ink-soft">{item.description}</p>
              </div>
              <span className="whitespace-nowrap text-ink-soft tabular-nums">
                {item.quantity} × $ {formatPrice(item.unitPrice)}
              </span>
              <span className="w-20 text-right font-bold text-ink tabular-nums">$ {formatPrice(item.quantity * item.unitPrice)}</span>
            </li>
          ))}
        </ul>
      )}
    </article>
  )
}
