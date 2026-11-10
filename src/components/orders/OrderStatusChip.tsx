import type { OrderStatus } from '../../types/order'

const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pendiente: 'Pendiente',
  confirmado: 'Confirmado',
  enviado: 'Enviado',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
}

/** Pedidos en curso: se marcan con el rojo de marca. Los finales van en neutro. */
const ACTIVE: ReadonlySet<OrderStatus> = new Set(['pendiente', 'confirmado', 'enviado'])

/** Estado del pedido como chip. Un solo acento (rojo) para lo que está en curso; lo terminado en gris. */
export function OrderStatusChip({ status }: { status: OrderStatus }) {
  const active = ACTIVE.has(status)
  const cancelled = status === 'cancelado'
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide uppercase ring-1 ${
        active ? 'bg-white text-brand-text ring-brand' : 'bg-canvas text-ink-soft ring-line'
      } ${cancelled ? 'line-through decoration-ink-soft/60' : ''}`}
    >
      <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-brand' : 'bg-ink-soft'}`} />
      {ORDER_STATUS_LABEL[status]}
    </span>
  )
}
