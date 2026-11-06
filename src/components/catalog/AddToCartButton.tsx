import { useCart } from '../../cart/useCart'
import type { AlternativeArticle } from '../../types/article'
import { QuantityStepper } from './QuantityStepper'

interface AddToCartButtonProps {
  article: AlternativeArticle
}

/**
 * Columna PEDIR de cada equivalente. Si el artículo no está en el carrito
 * muestra el botón de agregar; una vez agregado, el control de cantidad.
 */
export function AddToCartButton({ article }: AddToCartButtonProps) {
  const { items, add, setQuantity } = useCart()
  const inCart = items.find((i) => i.article.articleCode === article.articleCode)?.quantity ?? 0

  if (inCart > 0) {
    return (
      <QuantityStepper
        size="sm"
        value={inCart}
        code={article.particularCode}
        onChange={(q) => setQuantity(article.articleCode, q)}
      />
    )
  }

  return (
    <button
      type="button"
      onClick={() => add(article)}
      aria-label={`Agregar ${article.brandName} ${article.particularCode} al carrito`}
      className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-brand ring-1 ring-brand/50 transition active:scale-95 hover:bg-brand hover:text-white hover:ring-brand focus-visible:ring-4 focus-visible:ring-brand/30 focus-visible:outline-none"
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
        <path d="M12 8v4M10 10h4" />
      </svg>
    </button>
  )
}
