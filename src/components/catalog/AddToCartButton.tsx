import { useCallback, useEffect, useRef, useState } from 'react'
import { useCart } from '../../cart/useCart'
import type { AlternativeArticle } from '../../types/article'
import { QuantityStepper } from './QuantityStepper'

interface AddToCartButtonProps {
  article: AlternativeArticle
  /** Milisegundos sin actividad antes de que el control de cantidad se cierre solo. */
  idleMs?: number
}

const DEFAULT_IDLE_MS = 2500

/**
 * Columna PEDIR de cada equivalente.
 * - Sin nada en el carrito: botón de agregar.
 * - Al tocar: se abre el control − [cantidad] +. Tras unos segundos sin actividad
 *   se cierra solo y queda el botón con la cantidad que hay en el carrito.
 * - Tocar el botón con cantidad vuelve a abrir el control.
 */
export function AddToCartButton({ article, idleMs = DEFAULT_IDLE_MS }: AddToCartButtonProps) {
  const { items, add, setQuantity } = useCart()
  const inCart = items.find((i) => i.article.articleCode === article.articleCode)?.quantity ?? 0
  const [editing, setEditing] = useState(false)
  const [activityTick, setActivityTick] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const touch = useCallback(() => setActivityTick((n) => n + 1), [])

  // Cierre automático: se reprograma con cada interacción y espera mientras
  // el campo de cantidad tenga el foco (el usuario puede estar escribiendo).
  useEffect(() => {
    if (!editing) return
    const id = setTimeout(() => {
      const input = containerRef.current?.querySelector('input')
      if (input && document.activeElement === input) {
        touch()
        return
      }
      setEditing(false)
    }, idleMs)
    return () => clearTimeout(id)
  }, [editing, activityTick, idleMs, touch])

  if (editing && inCart > 0) {
    return (
      <div ref={containerRef}>
        <QuantityStepper
          size="sm"
          value={inCart}
          code={article.particularCode}
          onActivity={touch}
          onChange={(q) => {
            setQuantity(article.articleCode, q)
            if (q === 0) setEditing(false)
          }}
        />
      </div>
    )
  }

  const label =
    inCart > 0
      ? `${article.brandName} ${article.particularCode}: ${inCart} en el carrito, cambiar cantidad`
      : `Agregar ${article.brandName} ${article.particularCode} al carrito`

  return (
    <button
      type="button"
      aria-label={label}
      onClick={() => {
        if (inCart === 0) add(article)
        touch()
        setEditing(true)
      }}
      className={`relative flex h-10 w-10 items-center justify-center rounded-full transition active:scale-95 focus-visible:ring-4 focus-visible:ring-brand/30 focus-visible:outline-none ${
        inCart > 0
          ? 'bg-brand text-white'
          : 'bg-white text-brand ring-1 ring-brand/50 hover:bg-brand hover:text-white hover:ring-brand'
      }`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
        aria-hidden
      >
        <circle cx="9" cy="20" r="1" />
        <circle cx="18" cy="20" r="1" />
        <path d="M2 3h3l2.5 11h11L21 7H6.2" />
        {inCart === 0 && <path d="M12 8v4M10 10h4" />}
      </svg>
      {inCart > 0 && (
        <span
          aria-hidden
          className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-[10px] font-bold text-brand-text ring-2 ring-brand"
        >
          {inCart}
        </span>
      )}
    </button>
  )
}
