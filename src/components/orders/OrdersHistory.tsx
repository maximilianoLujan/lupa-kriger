import type { ArticlesRepository } from '../../data/articles'
import { supportsInfiniteScroll, useInfiniteScroll } from '../../hooks/useInfiniteScroll'
import { useOrdersHistory } from '../../hooks/useOrdersHistory'
import { Button } from '../ui/Button'
import { LinkButton } from '../ui/LinkButton'
import { OrderCard } from './OrderCard'

interface OrdersHistoryProps {
  repository: ArticlesRepository
}

/**
 * Historial de pedidos con scroll infinito: al llegar al final del listado se pide la página siguiente.
 * Sin pedidos, explica qué va a aparecer acá.
 */
export function OrdersHistory({ repository }: OrdersHistoryProps) {
  const { orders, total, hasMore, loading, error, loadMore, retry } = useOrdersHistory(repository)
  const sentinel = useInfiniteScroll(loadMore, Boolean(hasMore) && !loading && !error)

  const isEmpty = !loading && !error && orders.length === 0

  return (
    <div className="space-y-3">
      <p className="text-xs text-ink-soft" aria-live="polite">
        {loading && orders.length === 0
          ? 'Cargando tus pedidos…'
          : orders.length > 0
            ? `${orders.length} de ${total} ${total === 1 ? 'pedido' : 'pedidos'}`
            : ''}
      </p>

      {orders.map((order) => (
        <OrderCard key={order.id} order={order} />
      ))}

      {loading && (
        <div className="flex justify-center py-6" role="status" aria-label="Cargando pedidos">
          <span className="h-7 w-7 animate-spin rounded-full border-2 border-line border-t-brand" />
        </div>
      )}

      {error && (
        <div className="rounded-2xl bg-brand-soft p-4 text-center text-sm text-brand-text">
          <p role="alert">{error}</p>
          <Button type="button" size="sm" onClick={retry} className="mx-auto mt-3">
            Reintentar
          </Button>
        </div>
      )}

      {isEmpty && <OrdersEmpty />}

      {/* Centinela del scroll infinito. Si el navegador no lo soporta, queda el botón. */}
      {hasMore && !loading && !error && (
        <div ref={sentinel} className="flex justify-center py-2" data-testid="orders-sentinel">
          {!supportsInfiniteScroll() && (
            <Button type="button" variant="secondary" size="sm" onClick={loadMore}>
              Cargar más pedidos
            </Button>
          )}
        </div>
      )}

      {!hasMore && orders.length > 0 && (
        <p className="py-2 text-center text-xs text-ink-soft">Esos son todos tus pedidos.</p>
      )}
    </div>
  )
}

function OrdersEmpty() {
  return (
    <div className="rounded-2xl bg-white px-6 py-10 text-center shadow-sm ring-1 ring-line">
      <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-canvas text-brand ring-1 ring-line">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8" aria-hidden>
          <path d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5v-9Z" />
          <path d="M3 7.5 12 12l9-4.5M12 12v9" />
        </svg>
      </span>
      <h3 className="mt-4 text-lg font-bold text-ink">Todavía no tenés pedidos</h3>
      <p className="mx-auto mt-1 max-w-sm text-sm text-ink-soft">
        Cuando envíes tu primer pedido lo vas a ver acá, con su fecha, estado y el detalle de cada repuesto.
      </p>
      <LinkButton to="/" variant="secondary" size="sm" className="mx-auto mt-6">
        Ir al catálogo
      </LinkButton>
    </div>
  )
}
