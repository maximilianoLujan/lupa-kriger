import { useCart } from '../../cart/useCart'
import { formatPrice } from '../../utils/formatPrice'
import { QuantityStepper } from '../catalog/QuantityStepper'
import { Button } from '../ui/Button'
import { LinkButton } from '../ui/LinkButton'

/**
 * Contenido del carrito en la pantalla `/carrito`: renglones con cantidad editable,
 * total y acciones. Vacío, invita a volver al catálogo.
 */
export function CartItems() {
  const { items, count, total, setQuantity, remove, clear } = useCart()

  if (items.length === 0) return <CartEmpty />

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
        <div className="flex flex-col gap-2 sm:flex-row-reverse">
          <Button type="button" disabled title="Próximamente" className="sm:flex-1">
            Enviar pedido · Próximamente
          </Button>
          <LinkButton to="/" variant="secondary" className="sm:flex-1">
            Seguir buscando
          </LinkButton>
        </div>
        <button
          type="button"
          onClick={clear}
          className="w-full text-center text-xs font-medium text-ink-soft transition hover:text-brand-text"
        >
          Vaciar carrito
        </button>
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
