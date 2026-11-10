import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useCart } from '../../cart/useCart'
import type { ArticlesRepository } from '../../data/articles'
import { useCreateOrder } from '../../hooks/useCreateOrder'
import { errorMessage } from '../../lib/http'
import type { Order } from '../../types/order'
import { formatPrice } from '../../utils/formatPrice'
import { Button } from '../ui/Button'

interface SendOrderDialogProps {
  repository: ArticlesRepository
  /** Se llama con el pedido creado; el carrito ya quedó vacío. */
  onSent: (order: Order) => void
  onClose: () => void
}

/** El último número de cliente usado se recuerda en este navegador, para no volver a escribirlo en cada pedido. */
const CUSTOMER_CODE_KEY = 'cart:customerCode'

function readSavedCustomerCode(): string {
  try {
    return localStorage.getItem(CUSTOMER_CODE_KEY) ?? ''
  } catch {
    return ''
  }
}

function saveCustomerCode(code: string) {
  try {
    localStorage.setItem(CUSTOMER_CODE_KEY, code)
  } catch {
    // Sin storage (modo privado, bloqueado): se pide de nuevo la próxima vez.
  }
}

const MISSING_CUSTOMER_CODE = 'Ingresá tu número de cliente para enviar el pedido.'

/**
 * Modal para enviar el carrito: pide el número de cliente (el de las facturas o remitos) y manda el pedido.
 * Se cierra con Escape, con Cancelar o tocando el fondo; mientras se envía no se puede cerrar.
 * Va en un portal al body para que ningún contenedor lo recorte.
 */
export function SendOrderDialog({ repository, onSent, onClose }: SendOrderDialogProps) {
  const { items, count, total, clear } = useCart()
  const createOrder = useCreateOrder(repository)
  const [customerCode, setCustomerCode] = useState(readSavedCustomerCode)
  const [missingCode, setMissingCode] = useState(false)
  const codeInput = useRef<HTMLInputElement>(null)
  const onCloseRef = useRef(onClose)
  useEffect(() => {
    onCloseRef.current = onClose
  })

  const busy = createOrder.isPending

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    codeInput.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current()
    }
    document.addEventListener('keydown', onKey)
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
      previous?.focus()
    }
  }, [])

  function send() {
    const code = customerCode.trim()
    if (!code) {
      setMissingCode(true)
      codeInput.current?.focus()
      return
    }
    setMissingCode(false)
    createOrder.mutate(
      { customerCode: code, items: items.map(({ article, quantity }) => ({ code: article.particularCode, quantity })) },
      {
        onSuccess: (order) => {
          saveCustomerCode(code)
          clear()
          onSent(order)
        },
      },
    )
  }

  const error = missingCode
    ? MISSING_CUSTOMER_CODE
    : createOrder.isError
      ? errorMessage(createOrder.error, 'No se pudo enviar el pedido. Probá de nuevo.')
      : null

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="send-order-title"
      onClick={(e) => {
        if (e.target === e.currentTarget && !busy) onClose()
      }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-4 backdrop-blur-sm sm:items-center"
    >
      <form
        onSubmit={(e) => {
          e.preventDefault()
          send()
        }}
        className="w-full max-w-md space-y-4 rounded-2xl bg-white p-5 shadow-xl ring-1 ring-line"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="send-order-title" className="text-lg font-bold text-ink">
              Enviar pedido
            </h2>
            <p className="mt-0.5 text-sm text-ink-soft tabular-nums">
              {count} {count === 1 ? 'unidad' : 'unidades'} · <span className="font-semibold text-ink">$ {formatPrice(total)}</span>
            </p>
          </div>
          <button
            type="button"
            aria-label="Cerrar"
            onClick={onClose}
            disabled={busy}
            className="rounded-full p-2 text-ink-soft transition hover:bg-canvas hover:text-ink disabled:opacity-50"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-5 w-5" aria-hidden>
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div>
          <label htmlFor="customer-code" className="text-sm font-semibold text-ink">
            Tu número de cliente
          </label>
          <input
            ref={codeInput}
            id="customer-code"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            placeholder="Ej.: 1024"
            value={customerCode}
            disabled={busy}
            onChange={(e) => {
              setCustomerCode(e.target.value)
              if (e.target.value.trim()) setMissingCode(false)
            }}
            aria-describedby="customer-code-help"
            aria-invalid={missingCode || undefined}
            className={`mt-1 h-12 w-full rounded-xl border bg-white px-4 text-base text-ink tabular-nums shadow-sm placeholder:text-ink-soft focus:ring-4 focus:ring-brand/30 focus:outline-none ${
              missingCode ? 'border-brand' : 'border-line focus:border-brand'
            }`}
          />
          <p id="customer-code-help" className="mt-1 text-xs text-ink-soft">
            Es el número que figura en tus facturas o remitos. Si no lo tenés, pedíselo a la empresa.
          </p>
        </div>

        {error && (
          <p role="alert" className="rounded-xl bg-brand-soft px-4 py-3 text-sm text-brand-text">
            {error}
          </p>
        )}

        <div className="flex flex-col gap-2 sm:flex-row-reverse">
          <Button type="submit" loading={busy} className="sm:flex-1">
            {busy ? 'Enviando…' : 'Enviar pedido'}
          </Button>
          <Button type="button" variant="secondary" onClick={onClose} disabled={busy} className="sm:flex-1">
            Cancelar
          </Button>
        </div>
      </form>
    </div>,
    document.body,
  )
}
