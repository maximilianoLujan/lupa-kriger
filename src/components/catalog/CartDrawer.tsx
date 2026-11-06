import { useEffect } from 'react'
import { useCart } from '../../cart/useCart'
import { formatPrice } from '../../utils/formatPrice'
import { Button } from '../ui/Button'

interface CartDrawerProps {
  open: boolean
  onClose: () => void
}

/** Panel lateral con el contenido del carrito. En mobile ocupa todo el ancho. */
export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { items, count, total, setQuantity, remove, clear } = useCart()

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <button type="button" aria-label="Cerrar carrito" onClick={onClose} className="absolute inset-0 bg-ink/20" />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
        className="relative flex h-full w-full max-w-md flex-col bg-white shadow-2xl shadow-lilac"
      >
        <header className="flex items-center justify-between border-b border-line px-4 py-3">
          <h2 id="cart-title" className="text-lg font-bold text-ink">
            Carrito{count > 0 && <span className="ml-2 text-sm font-medium text-ink-soft">{count} u.</span>}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="rounded-full p-2 text-ink-soft hover:bg-canvas hover:text-ink"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-5 w-5" aria-hidden>
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </header>

        {items.length === 0 ? (
          <p className="flex flex-1 items-center justify-center p-8 text-center text-sm text-ink-soft">
            Todavía no agregaste repuestos.
          </p>
        ) : (
          <ul className="flex-1 divide-y divide-line overflow-y-auto px-4">
            {items.map(({ article, quantity }) => (
              <li key={article.articleCode} className="flex items-center gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">{article.brandName}</p>
                  <p className="truncate text-xs text-ink-soft">{article.particularCode}</p>
                  <p className="text-xs font-semibold text-emerald-600">$ {formatPrice(article.priceList * quantity)}</p>
                </div>
                <div className="flex items-center rounded-full bg-canvas ring-1 ring-line">
                  <button
                    type="button"
                    aria-label={`Restar ${article.particularCode}`}
                    onClick={() => setQuantity(article.articleCode, quantity - 1)}
                    className="h-8 w-8 rounded-full text-ink hover:bg-brand-soft"
                  >
                    −
                  </button>
                  <span className="w-7 text-center text-sm font-semibold text-ink tabular-nums" aria-label={`Cantidad ${article.particularCode}`}>
                    {quantity}
                  </span>
                  <button
                    type="button"
                    aria-label={`Sumar ${article.particularCode}`}
                    onClick={() => setQuantity(article.articleCode, quantity + 1)}
                    className="h-8 w-8 rounded-full text-ink hover:bg-brand-soft"
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  aria-label={`Quitar ${article.particularCode}`}
                  onClick={() => remove(article.articleCode)}
                  className="rounded-full p-2 text-ink-soft hover:bg-brand-soft hover:text-brand-text"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-4 w-4" aria-hidden>
                    <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        )}

        <footer className="space-y-3 border-t border-line p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-ink-soft">Total</span>
            <span className="text-lg font-bold text-emerald-600 tabular-nums">$ {formatPrice(total)}</span>
          </div>
          <Button type="button" disabled={items.length === 0} title="Próximamente">
            Enviar pedido · Próximamente
          </Button>
          {items.length > 0 && (
            <button type="button" onClick={clear} className="w-full text-center text-xs text-ink-soft hover:text-brand-text">
              Vaciar carrito
            </button>
          )}
        </footer>
      </aside>
    </div>
  )
}
